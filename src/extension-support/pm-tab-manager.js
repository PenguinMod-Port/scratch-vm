class Tab {
    constructor(tabID, name, uri, runtime) {
        this.id = tabID;
        this.name = name;
        this.uri = uri;
        this.element = null;
        this.runtime = runtime;
        this.enabled = true;
        this.visible = true;
    }
    update() {
        this.runtime.emit('EDITOR_TABS_UPDATE');
    }

    setName(name) {
        this.name = name;
        this.update();
    }

    setURI(uri) {
        this.uri = uri;
        this.update();
    }

    setDOM(element) {
        this.element = element;
        this.update();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.update();
    }

    setVisible(visible) {
        this.visible = visible;
        if(visible == false) {
            this.enabled = false;
        }
        this.update();
    }
}


class TabManager {
    constructor(runtime) {
        this.runtime = runtime;
        this.tabs = {};
    }

    register(id, name, uri) {
        //validation
        if(!id) {
            console.warn("Tabs need ids");
            return;
        }
        if(!name) {
            name = id;
        }
        if(!uri) {
            //question mark
            uri = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20width%3D%227.8%22%20height%3D%2211.85236%22%20viewBox%3D%220,0,7.8,11.85236%22%3E%3Cg%20transform%3D%22translate(-316.1,-174.07382)%22%3E%3Cg%20fill%3D%22%2300c3ff%22%20stroke%3D%22none%22%20stroke-width%3D%220.5%22%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M320.82,182.48618h-1.8v-1.16c0,-0.6%200.36667,-1.21334%201.1,-1.84v0l1.14,-0.96c0.56,-0.54666%200.84,-1.12%200.84,-1.72v0c0,-0.64%20-0.43333,-1.06667%20-1.3,-1.28v0c-0.81333,-0.2%20-1.57334,-0.15334%20-2.28,0.14v0c-0.46666,0.2%20-0.7,0.46%20-0.7,0.78v0v0.36h-1.72v-0.36c0,-0.89334%200.56,-1.56%201.68,-2v0c1.13333,-0.42667%202.33334,-0.48667%203.6,-0.18v0c1.30667,0.32%202.11334,0.94%202.42,1.86v0c0.06667,0.21334%200.1,0.44%200.1,0.68v0c0,0.84%20-0.44666,1.64666%20-1.34,2.42v0l-1.18,1.04c-0.37333,0.37333%20-0.56,0.72666%20-0.56,1.06v0zM318.34,184.50618v0c0,-0.53333%200.26666,-0.94%200.8,-1.22v0c0.25333,-0.13333%200.53334,-0.2%200.84,-0.2v0c0.64,0%201.12,0.24666%201.44,0.74v0c0.13333,0.21334%200.2,0.44%200.2,0.68v0c0,0.53333%20-0.26666,0.94%20-0.8,1.22v0c-0.25333,0.13333%20-0.53333,0.2%20-0.84,0.2v0c-0.64,0%20-1.12,-0.24666%20-1.44,-0.74v0c-0.13333,-0.21334%20-0.2,-0.44%20-0.2,-0.68z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
        }
        if(this.tabs[id] !== undefined) {
            console.warn("Tab: " + id + " already exists!");
            return this.tabs[id];
        }
        const tab = new Tab(id, name, uri, this.runtime);
        this.tabs[id] = tab;
        this.runtime.emit('EDITOR_TABS_UPDATE');
        return tab;
    }
}

module.exports = TabManager;