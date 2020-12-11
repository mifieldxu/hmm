"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const express = require("express");
const path = require("path");
const http_status_codes_1 = require("http-status-codes");
const index_1 = __importDefault(require("./routes/index"));
const user_1 = __importDefault(require("./routes/user"));
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index_1.default);
app.use('/users', user_1.default);
// catch 404 and forward to error handler
app.use((_req, _res, next) => {
    const err = new Error(http_status_codes_1.ReasonPhrases.NOT_FOUND);
    err.status = http_status_codes_1.StatusCodes.FORBIDDEN;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, _req, res, _next) => {
        res.status(err.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
        res.render('error', {
            message: err.message || http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use((err, _req, res, _next) => {
    res.status(err.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
    res.render('error', {
        message: err.message || http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: {}
    });
});
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
//# sourceMappingURL=app.js.map