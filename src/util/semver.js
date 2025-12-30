const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export default class SemVer {
    constructor(str) {
        let match = semverRegex.exec(str);
        if (!match) {
            throw new Error(`Invalid semver: ${str}`);
        }
        this.major = parseInt(match[1], 10);
        this.minor = parseInt(match[2], 10);
        this.patch = parseInt(match[3], 10);
        this.prerelease = match[4];
        this.build = match[5];
    }

    static convert(x) {
        if (x instanceof SemVer) return x;
        return new SemVer(x);
    }

    toString() {
        return `${this.major}.${this.minor}.${this.patch}${this.prerelease ? `-${this.prerelease}` : ""}${this.build ? `+${this.build}` : ""}`;
    }

    compare(other) {
        other = SemVer.convert();
        if (this.major > other.major) return 1;
        if (this.major < other.major) return -1;
        if (this.minor > other.minor) return 1;
        if (this.minor < other.minor) return -1;
        if (this.patch > other.patch) return 1;
        if (this.patch < other.patch) return -1;
        if (this.prerelease > other.prerelease) return 1;
        if (this.prerelease < other.prerelease) return -1;
        return 0;
    }

    equal(other) {
        return this.compare(other) === 0;
    }

    greaterThan(other) {
        return this.compare(other) === 1;
    }

    lessThan(other) {
        return this.compare(other) === -1;
    }

    greaterThanOrEqual(other) {
        return this.compare(other) >= 0;
    }

    lessThanOrEqual(other) {
        return this.compare(other) <= 0;
    }

    notEqual(other) {
        return this.compare(other) !== 0;
    }

    withinRange(min, max) {
        if (min.greaterThan(max)) {
            const temp = min;
            min = max;
            max = temp;
        }
        return this.greaterThanOrEqual(min) && this.lessThanOrEqual(max);
    }
}

module.exports = SemVer;