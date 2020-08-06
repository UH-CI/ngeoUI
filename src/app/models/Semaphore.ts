export class Semaphore {
    level: number = null;
    max: number = null;

    q: (() => void)[] = null;

    constructor(level: number) {
        this.max = level;
        this.level = level;
        this.q = [];
    }

    acquires = 0;
    acquire() {
        // console.log(++this.acquires);
        let unblock = null;
        let block = new Promise((resolve) => {
            unblock = resolve;
        });
        if(this.level > 0) {
            this.level--;
            unblock();
        }
        else {
            this.q.push(unblock);
        }
        return block;
    }

    releases = 0;
    release() {
        // console.log(++this.releases);
        if(++this.level > this.max) {
            throw new Error("Semaphore released too many times");
        }
        if(this.q.length > 0) {
            this.level--;
            this.q.shift()();
        }
    }


}