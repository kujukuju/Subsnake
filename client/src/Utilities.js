class Utilities {
    static hermite(t, point0, point1, tangential0, tangential1, returnPoint) {
        throw 'NO HERMITE!!!';
        
        const n1 = 2 * t * t * t - 3 * t * t + 1;
        const n2 = t * t * t - 2 * t * t + t;
        const n3 = -2 * t * t * t + 3 * t * t;
        const n4 = t * t * t - t * t;

        returnPoint.x = n1 * point0.x + n2 * tangential0.x + n3 * point1.x + n4 * tangential1.x;
        returnPoint.y = n1 * point0.y + n2 * tangential0.y + n3 * point1.y + n4 * tangential1.y;
    }
}