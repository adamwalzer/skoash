import classNames from 'classnames';

import Component from 'components/component';

class Screen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false,
            open: false,
            leaving: false,
            leave: false,
            close: true,
            complete: false,
            load: props.load,
        };

        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.loadHelper = this.loadHelper.bind(this);
        this.unloadHelper = this.unloadHelper.bind(this);
        this.startCallback = this.startCallback.bind(this);
        this.startAfterOpen = this.startAfterOpen.bind(this);
        this.openHelper = this.openHelper.bind(this);
    }

    goto(index, buttonSound) {
        if (typeof index === 'string' || typeof index === 'number') {
            this.trigger('goto', {
                index,
                buttonSound
            });
        } else if (typeof index === 'object') {
            index.buttonSound = index.buttonSound || buttonSound;
            this.trigger('goto', index);
        }
    }

    back() {
        this.trigger('goBack');
    }

    next() {
        var state = this.props.gameState;

        if (!this.state.started || this.state.leaving ||
            (!state.demo && !this.state.complete && !this.state.replay)) return;

        this.setState({
            leaving: true
        });

        setTimeout(
            this.goto.bind(this, this.props.nextIndex || this.props.index + 1, this.media.audio.button),
            this.props.nextDelay || 0
        );
    }

    prev() {
        this.goto(this.props.prevIndex || this.props.index - 1);
    }

    loadHelper() {
        super.bootstrap();
        this.props.onLoad.call(this);
    }

    load(cb) {
        this.onReadyCallback = cb;
        if (!this.state.load) {
            this.setState({
                load: true,
                ready: false,
                complete: false,
            }, this.loadHelper);
        } else {
            _.invoke(this, 'onReadyCallback.call', this);
            this.onReadyCallback = null;
        }
    }

    unloadHelper() {
        this.props.onUnload.call(this);
    }

    unload() {
        if (this.state.load && this.props.shouldUnload) {
            this.setState({
                load: false,
            }, this.unloadHelper);
        }
    }

    bootstrap() {
        super.bootstrap();

        if (this.props.load) this.load();
    }

    replay(replay = true) {
        this.load();
        this.setState({
            replay,
        });
    }

    startCallback() {
        this.bootstrap();
        this.startMedia();
    }

    start() {
        super.start(this.startCallback);
    }

    startMedia() {
        if (this.media.video[0]) {
            this.playMedia('video.0');
        } else if (this.media.audio.voiceOver[0]) {
            this.playMedia('audio.voiceOver.0');
        }

        this.playMedia('start');
        this.playMedia(this.props.playOnStart);
    }

    complete(opts = {}) {
        super.complete(opts);
        setTimeout(() => {
            this.trigger('screenComplete', {
                screenID: this.props.id,
                silent: opts.silent || this.props.silentComplete || this.media['screen-complete']
            });

            this.playMedia('screen-complete');

            if (this.props.emitOnComplete) {
                this.trigger('emit', this.props.emitOnComplete);
            }
        }, this.props.completeDelay);
    }

    startAfterOpen() {
        if (!this.state.started) this.start();
        this.setState({
            opening: false
        });
    }

    openHelper() {
        if (this.props.startDelay) {
            setTimeout(this.startAfterOpen, this.props.startDelay);
        } else {
            if (!this.state.started) this.start();
            this.setState({
                opening: false
            });
        }

        this.props.onOpen.call(this);

        this.loadData();
    }

    open(opts) {
        this.setState({
            load: true,
            open: true,
            opening: true,
            leaving: false,
            leave: false,
            close: false,
            replay: this.state.complete || this.state.replay,
            opts,
        }, this.openHelper);
    }

    leave() {
        this.setState({
            open: false,
            leave: true,
            close: false,
        });
        this.stop();
    }

    close() {
        this.setState({
            open: false,
            leave: false,
            close: true,
        });
        this.stop();
    }

    collectData() {
        return this.props.collectData.call(this);
    }

    loadData() {
        return this.props.loadData.call(this);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);

        if (props.load && props.load !== this.props.load) this.load();
    }

    renderContent() {
        if (!this.state.load) return null;
        return (
            <div className="screen-content">
                {this.renderContentList()}
            </div>
        );
    }

    renderPrevButton() {
        if (this.props.hidePrev) return null;
        return this.props.renderPrevButton.call(this);
    }

    renderNextButton() {
        if (this.props.hideNext) return null;
        return this.props.renderNextButton.call(this);
    }

    render() {
        return (
            <div id={this.props.id} className={this.getClassNames()}>
                {this.renderContent()}
                {this.renderPrevButton()}
                {this.renderNextButton()}
            </div>
        );
    }
}

Screen.defaultProps = _.defaults({
    componentName: 'screen',
    load: false,
    resetOnClose: true,
    startDelay: 250,
    collectData: _.noop,
    loadData: _.noop,
    onOpen: _.noop,
    onLoad: _.noop,
    onUnload: _.noop,
    shouldUnload: true,
    gameState: {},
    hidePrev: false,
    hideNext: false,
    renderPrevButton: function () {
        return (
            <button
                className={classNames('prev-screen', this.props.prevButtonClassName)}
                onClick={this.prev}
            >
                {this.props.prevContent}
            </button>
        );
    },
    renderNextButton: function () {
        return (
            <button
                className={classNames('next-screen', this.props.nextButtonClassName)}
                onClick={this.next}
            >
                {this.props.nextContent}
            </button>
        );
    },
    prevContent: null,
    nextContent: null,
}, Component.defaultProps);

export default Screen;
