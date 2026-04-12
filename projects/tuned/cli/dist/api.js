/**
 * Check if a prompt exists in the registry
 */
export async function checkPromptExists(name, config) {
    try {
        const response = await fetch(config.backendUrl + "/api/prompts/" + name, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + config.apiKey,
            },
        });
        return response.ok;
    }
    catch (error) {
        throw new Error("Failed to check if prompt exists: " + (error instanceof Error ? error.message : String(error)));
    }
}
/**
 * Create a new prompt in the registry
 */
export async function createPrompt(name, config) {
    try {
        const response = await fetch(config.backendUrl + "/api/prompts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + config.apiKey,
            },
            body: JSON.stringify({ name }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error("Failed to create prompt: " + response.status + " - " + error);
        }
    }
    catch (error) {
        throw new Error("Failed to create prompt: " + (error instanceof Error ? error.message : String(error)));
    }
}
/**
 * Create a new version of a prompt
 * Returns the version number
 */
export async function createVersion(name, content, config) {
    try {
        const response = await fetch(config.backendUrl + "/api/prompts/" + name + "/versions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + config.apiKey,
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error("Failed to create version: " + response.status + " - " + error);
        }
        const data = (await response.json());
        return data.version;
    }
    catch (error) {
        throw new Error("Failed to create version: " + (error instanceof Error ? error.message : String(error)));
    }
}
/**
 * List all prompts with their active versions
 * GET /api/prompts
 */
export async function listPrompts(config) {
    const url = config.backendUrl + "/api/prompts";
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error("Failed to list prompts: " +
            response.status +
            " " +
            response.statusText +
            " - " +
            errorBody);
    }
    const data = (await response.json());
    return data.prompts;
}
/**
 * List all versions for a specific prompt
 * GET /api/prompts/:name/versions
 */
export async function listVersions(name, config) {
    const url = config.backendUrl + "/api/prompts/" + encodeURIComponent(name) + "/versions";
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error("Failed to list versions: " +
            response.status +
            " " +
            response.statusText +
            " - " +
            errorBody);
    }
    const data = (await response.json());
    return data.versions;
}
/**
 * Activate a specific version (rollback)
 * PUT /api/prompts/:name/versions/:version/activate
 */
export async function activateVersion(name, version, config) {
    const url = config.backendUrl +
        "/api/prompts/" +
        encodeURIComponent(name) +
        "/versions/" +
        version +
        "/activate";
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + config.apiKey,
            },
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error("Failed to activate version: " +
                response.status +
                " " +
                response.statusText +
                " - " +
                errorBody);
        }
        const data = (await response.json());
        return data;
    }
    catch (error) {
        throw new Error("Failed to activate version: " +
            (error instanceof Error ? error.message : String(error)));
    }
}
