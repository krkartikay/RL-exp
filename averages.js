// average and moving average

export default class AverageValue {
    constructor(n){
        this.N = 0;
        this.value = 0;
        this.alpha = 0;
        if (n){
            this.alpha = 1/n;
        }
    }
    update(v){
        if (this.N == 0){
            this.value = v;
            this.N += 1;
        } else {
            if (this.alpha == 0){
                // exact average
                this.N += 1;
                this.value += (1/this.N) * (v - this.value);
            } else {
                // moving average
                this.N += 1;
                this.value += (this.alpha) * (v - this.value);
            }
        }
    }
}