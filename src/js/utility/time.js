
export function setCorrectingInterval(func, delay, control) {
    var instance = {};

    function tick( func, delay ) {
        if ( ! instance.started ) {
            instance.func = func;
            instance.delay = delay;
            instance.startTime = new Date().valueOf();
            instance.target = delay;
            instance.started = true;

            if (control.run) {
              setTimeout( tick, delay );
            }
        } else {
            var elapsed = new Date().valueOf() - instance.startTime,
            adjust = instance.target - elapsed;

            instance.func();
            instance.target += instance.delay;

            if (control.run) {
              setTimeout( tick, instance.delay + adjust );
            }

        }
    };

    return tick( func, delay );
}
