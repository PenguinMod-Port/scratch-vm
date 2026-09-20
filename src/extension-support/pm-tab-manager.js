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
            uri = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20width%3D%227.8%22%20height%3D%2211.85236%22%20viewBox%3D%220%2C0%2C7.8%2C11.85236%22%3E%3Cg%20transform%3D%22translate(-316.1%2C-174.07382)%22%3E%3Cg%20style%3D%22fill%3A%20%23fff%3B%22%20stroke%3D%22none%22%20stroke-width%3D%220.5%22%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M320.82%2C182.48618h-1.8v-1.16c0%2C-0.6%200.36667%2C-1.21334%201.1%2C-1.84v0l1.14%2C-0.96c0.56%2C-0.54666%200.84%2C-1.12%200.84%2C-1.72v0c0%2C-0.64%20-0.43333%2C-1.06667%20-1.3%2C-1.28v0c-0.81333%2C-0.2%20-1.57334%2C-0.15334%20-2.28%2C0.14v0c-0.46666%2C0.2%20-0.7%2C0.46%20-0.7%2C0.78v0v0.36h-1.72v-0.36c0%2C-0.89334%200.56%2C-1.56%201.68%2C-2v0c1.13333%2C-0.42667%202.33334%2C-0.48667%203.6%2C-0.18v0c1.30667%2C0.32%202.11334%2C0.94%202.42%2C1.86v0c0.06667%2C0.21334%200.1%2C0.44%200.1%2C0.68v0c0%2C0.84%20-0.44666%2C1.64666%20-1.34%2C2.42v0l-1.18%2C1.04c-0.37333%2C0.37333%20-0.56%2C0.72666%20-0.56%2C1.06v0zM318.34%2C184.50618v0c0%2C-0.53333%200.26666%2C-0.94%200.8%2C-1.22v0c0.25333%2C-0.13333%200.53334%2C-0.2%200.84%2C-0.2v0c0.64%2C0%201.12%2C0.24666%201.44%2C0.74v0c0.13333%2C0.21334%200.2%2C0.44%200.2%2C0.68v0c0%2C0.53333%20-0.26666%2C0.94%20-0.8%2C1.22v0c-0.25333%2C0.13333%20-0.53333%2C0.2%20-0.84%2C0.2v0c-0.64%2C0%20-1.12%2C-0.24666%20-1.44%2C-0.74v0c-0.13333%2C-0.21334%20-0.2%2C-0.44%20-0.2%2C-0.68z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
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