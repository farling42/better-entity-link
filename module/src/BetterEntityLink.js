export class BetterEntityLink {
    static get id() {
        return "better-entity-link"
    }

    static _contextMenuName() {
        return "BetterEntityLink"
    }

    static instance() {
        return game.modules.get(BetterEntityLink.id)?._instance
    }

    static registerAction(entityType, options) {
        const instance = BetterEntityLink.instance();
        if (instance === undefined) {
            BetterEntityLink.initialize()
            return BetterEntityLink.registerAction(entityType, options);
        }
        return instance.registerAction(entityType, options)
    }

    static enhanceEntityLinks(app, html, data) {
        return BetterEntityLink.instance().enhanceEntityLinks(app, html, data)
    }

    static registerActorAction(options) {
        return BetterEntityLink.registerAction("Actor", options);
    }

    static registerItemAction(options) {
        return BetterEntityLink.registerAction("Item", options);
    }

    static registerSceneAction(options) {
        return BetterEntityLink.registerAction("Scene", options);
    }

    static registerJournalEntryAction(options) {
        return BetterEntityLink.registerAction("JournalEntry", options);
    }

    static registerJournalEntryPageAction(options) {
        return BetterEntityLink.registerAction("JournalEntryPage", options);
    }

    static registerMacroAction(options) {
        return BetterEntityLink.registerAction("Macro", options);
    }

    static registerRolltableAction(options) {
        return BetterEntityLink.registerAction("RollTable", options);
    }

    static registerCardStacksAction(options) {
        return BetterEntityLink.registerAction("Cards", options);
    }

    static registerPlaylistAction(options) {
        return BetterEntityLink.registerAction("Playlist", options);
    }

    static _defaultContextMenu() {
        return {
            "Actor": [],
            "Item": [],
            "Scene": [],
            "JournalEntry": [],
            "JournalEntryPage": [],
            "Macro": [],
            "RollTable": [],
            "Cards": [],
            "Playlist": []
        };
    }

    static initialize() {
        if (BetterEntityLink.instance() !== undefined) return;

        const module = game.modules.get(BetterEntityLink.id);
        const instance = new BetterEntityLink(module);
        module.registerAction =  instance.registerAction;
        module.enhanceEntityLink = instance.registerAction;
        module.enhanceEntityLinks = instance.enhanceEntityLinks;

        module.registerActorAction = BetterEntityLink.registerActorAction;
        module.registerItemAction = BetterEntityLink.registerItemAction;
        module.registerSceneAction = BetterEntityLink.registerSceneAction;
        module.registerJournalEntryAction = BetterEntityLink.registerJournalEntryAction;
        module.registerJournalEntryPageAction = BetterEntityLink.registerJournalEntryPageAction;
        module.registerMacroAction = BetterEntityLink.registerMacroAction;
        module.registerRolltableAction = BetterEntityLink.registerRolltableAction;
        module.registerCardStacksAction = BetterEntityLink.registerCardStacksAction;
        module.registerPlaylistAction = BetterEntityLink.registerPlaylistAction;
    }

    constructor(module) {
        this.contextMenus = duplicate(BetterEntityLink._defaultContextMenu());
        module._instance = this;
    }

    registerAction(entityType, options) {
        const actionMenu = {
            name: options.name,
            icon: `<i class="fas ${options.icon}"></i>`,
            condition: li => {
                const entity = fromUuidSync(li.data("uuid"));
                return entityType.localeCompare(entity.documentName, undefined, {sensitivity: "base"}) === 0
                        && (options.condition instanceof Function && options.condition(entity));
            },
            callback: async li => {
                const entity = await fromUuid(li.data("uuid"));
                return await options.callback(entity);
            }
        }
        this.contextMenus[entityType].push(actionMenu);
    }

    enhanceEntityLink(app, link) {
        const entityType = this._resolveEntityType($(link));
        const contextOptions = this.contextMenus[entityType];
        if (!contextOptions?.length) return undefined;
        ContextMenu.create(app, $(link), "a.content-link", contextOptions, BetterEntityLink._contextMenuName);
    }

    enhanceEntityLinks(app, html, data) {
        if (html === null || html === undefined) return undefined;

        const links = html.find("a.content-link:not([data-contextmenu])");
        if (links === null || links === undefined || (Array.isArray(links) && !links.length)) return undefined;

        setTimeout(() => {
            for (let link of links) {
                this.enhanceEntityLink(app, $(link));
            }
        }, 100);
    }

    _resolveEntityType(entityLink) {
        if (entityLink[0].hasAttribute("data-type")) return entityLink.data("type");
        if (entityLink[0].hasAttribute("data-pack")) {
            const packId = entityLink.data("pack");
            return game.packs.get(packId).documentName;
        }
        // TODO: add resolving from <i> font-awesome icon class
        return undefined;
    }
}
