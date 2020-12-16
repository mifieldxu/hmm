import debug from 'debug';
import express from 'express';
import path from 'path';
import url from 'url';
import {StatusCodes, ReasonPhrases} from 'http-status-codes';

import routes from './routes/index';
import users from './routes/user';
import inspector from 'inspector';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
    const err: Error & {status?: Number} = new Error(ReasonPhrases.NOT_FOUND);
    err.status = StatusCodes.FORBIDDEN;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR);
        res.render('error', {
            message: err.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    res.render('error', {
        message: err.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function (): void {
    debug('Express server listening on port ' + server.address()!);
});
