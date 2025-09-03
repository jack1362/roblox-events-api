import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

import requireAuth from "./middleware/requireAuth.js";

// Show the actual IP a request came from to the apps, instead of always 127.0.0.1
app.set('trust proxy', 1);

app.use(express.json());

app.get("/events/:placeId", requireAuth, async (req, res) => {
  const { placeId } = req.params;

  try {
    // Get universe ID
    const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const uni = await uniRes.json();

    if (!uni.universeId) {
      return res.status(404).json({ error: "Universe not found" });
    }

    // Get virtual events
    const eventRes = await fetch(`https://apis.roblox.com/virtual-events/v1/universes/${uni.universeId}/virtual-events`);
    const events = await eventRes.json();

    // Only keep the important fields
    const simplifiedData = events.data.map((e) => ({
      id: e.id,
      title: e.title,
      displayTitle: e.displayTitle,
      subtitle: e.subtitle,
      displaySubtitle: e.displaySubtitle,
      description: e.description,
      displayDescription: e.displayDescription,
      eventTime: e.eventTime,
      eventStatus: e.eventStatus,
      eventVisibility: e.eventVisibility,
    }));

    res.json({
      universeId: uni.universeId,
      events: {
        nextPageCursor: events.nextPageCursor || "",
        previousPageCursor: events.previousPageCursor || "",
        data: simplifiedData
      }
    });
  } catch (err) {
    console.error("Error fetching Roblox data:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox Events API running on port ${PORT}`);
});
