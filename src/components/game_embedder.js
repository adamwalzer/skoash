import Component from 'components/component';

class GameEmbedder extends Component {
    constructor(props) {
        super(props);

        this.respond = this.respond.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.onLoadHelper = this.onLoadHelper.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    bootstrap() {
        super.bootstrap();

        this.gameNode = ReactDOM.findDOMNode(this.refs.game);
        this.gameNode.addEventListener('game-event', this.respond);
    }

    respond(opts) {
        if (opts.ready) {
            this.gameReady();
        } else if (opts.complete) {
            this.complete();
        } else if (opts.updateGameState) {
            // remove this once updateGameState is removed from the Game Component
            this.updateGameState(opts.updateGameState);
        } else if (opts.updateGameData) {
            this.updateGameData(opts.updateGameData);
        } else if (opts.updateScreenData) {
            this.updateScreenData(opts.updateScreenData);
        }

        this.props.onRespond.call(this, opts);
    }

    gameReady() {
        this.setState({
            gameReady: true,
        });
    }

    onLoadHelper() {
        this.props.onLoad.call(this);
    }

    onLoad() {
        this.setState({
            loaded: true,
        }, this.onLoadHelper);
    }

    onClick() {
        if (!this.props.pauseOnClick) return;
        if (!this.state.paused) {
            this.pause();
        } else {
            this.resume();
        }
    }

    start() {
        super.start();
        if (!this.state.gameReady) return;
        this.setState({paused: false});
        this.emitEvent({ name: 'start' });
    }

    pause() {
        super.pause();
        if (!this.state.gameReady) return;
        this.setState({paused: true});
        this.emitEvent({ name: 'pause' });
    }

    resume(force = false) {
        if (this.props.pause && !force) return;
        super.resume();
        this.setState({paused: false});
        this.emitEvent({ name: 'resume' });
    }

    emitEvent(data) {
        var e = new Event('skoash-event');

        if (!this.state.loaded || !this.state.gameReady) return;

        e.name = data.name;
        e.data = data;
        this.gameNode.contentWindow.dispatchEvent(e);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);

        if (props.controller) {
            this.emitEvent({
                name: 'controller-update',
                controller: props.controller,
            });
        }

        if (props.data) {
            this.emitEvent({
                name: 'data-update',
                data: props.data,
            });
        }

        if (props.state && props.state !== this.props.state) {
            this.emitEvent({
                name: 'state-update',
                data: props.state,
            });
        }

        if (props.pause && props.pause !== this.props.pause) {
            this.pause();
        }

        if (props.resume && props.resume !== this.props.resume) {
            this.resume(true);
        }
    }

    getStyle() {
        return _.defaults({}, this.props.style, {
            border: 0,
            pointerEvents: 'none',
        });
    }

    render() {
        return (
            <div
                onClick={this.onClick}
            >
                <iframe
                    {...this.props}
                    ref="game"
                    onLoad={this.onLoad}
                    style={this.getStyle()}
                />
            </div>
        );
    }
}

GameEmbedder.defaultProps = _.defaults({
    complete: false,
    checkComplete: false,
    onLoad: _.noop,
    onRespond: _.noop,
    pauseOnClick: false,
}, Component.defaultProps);

export default GameEmbedder;
