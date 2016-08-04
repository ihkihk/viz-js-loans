"use strict";

function waitfor(that, obj, checkfunc, callback) {
    while (checkfunc.call(obj) == false) {
        setTimeout(waitfor, 500, that, obj, checkfunc, callback);
		return;
    }
    callback.call(that);
}

/* EOF */
