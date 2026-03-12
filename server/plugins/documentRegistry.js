/**
 * Document Plugin Registry
 * 
 * Each plugin defines:
 *   - id: unique doc type key
 *   - name: display name
 *   - model: Mongoose model factory
 *   - aiPrompts: prompts used for AI generation
 *   - inputSchema: expected input fields
 *   - outputFormat: 'json' | 'html' | 'pdf'
 */

const registry = new Map();

export const registerPlugin = (plugin) => {
    if (!plugin.id || !plugin.name || !plugin.aiPrompts) {
        throw new Error(`Plugin must define id, name, and aiPrompts`);
    }
    registry.set(plugin.id, plugin);
};

export const getPlugin = (id) => {
    const plugin = registry.get(id);
    if (!plugin) throw new Error(`No document plugin registered for type: ${id}`);
    return plugin;
};

export const getAllPlugins = () => {
    return Array.from(registry.values()).map(({ id, name, description, icon }) => ({
        id, name, description, icon
    }));
};

export default registry;
