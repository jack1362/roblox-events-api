const VPS_API_KEY = process.env.VPS_API_KEY

// These IPs are allowed to bypass auth
const ALLOWED_INTERNAL_IPS = new Set([
	'127.0.0.1',      // Localhost
	'::1',            // IPv6 localhost
	'172.17.0.1',     // Docker host (default bridge network)
]);

function requireAuth(req, res, next) {
    const remoteIp = req.ip.replace('::ffff:', '')

    if (ALLOWED_INTERNAL_IPS.has(remoteIp)) {
        return next();
    }
    
    const auth = req.header("Authorization");
    if (!auth) {
        return res.status(401).send("Missing Authorization header");
    }

    const parts = auth.split(" ");
    if (parts.length !== 2) {
        return res.status(400).send("Bad authorization format");
    }

    const scheme = parts[0];
    const token = parts[1];
    
    if (scheme !== "ApiKey") {
        return res.status(400).send("Unsupported auth scheme");
    }
    if (token !== VPS_API_KEY) {
        return res.status(403).send("Invalid token");
    }

    // auth complete woohoo
    next();
}

export default requireAuth;