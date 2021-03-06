import classNames from 'classnames';

class Component extends React.Component {
    constructor(props = Component.defaultProps) {
        super(props);

        this.state = {
            started: false,
            ready: !props.checkReady,
        };

        this.onReady = this.onReady || _.noop;

        this.start = _.throttle(this.start.bind(this), 100);
        this.ready = _.throttle(this.ready.bind(this), 100);
        this.complete = _.throttle(this.complete.bind(this), 100);

        this.incompleteHelper = this.incompleteHelper.bind(this);
        this.readyHelper = this.readyHelper.bind(this);
        this.stopHelper = this.stopHelper.bind(this);
        this.openHelper = this.openHelper.bind(this);
        this.openHelper = this.openHelper.bind(this);
        this.closeHelper = this.closeHelper.bind(this);
        this.collectMediaHelper = this.collectMediaHelper.bind(this);
    }

    trigger() {
        return skoash.trigger.apply(null, arguments);
    }

    invokeChildrenFunction(functionName, opts) {
        _.each(this.refs, ref => {
            _.invoke(ref, functionName, opts);
        });
    }

    complete(props) {
        props = _.defaults(props || {}, this.props);
        setTimeout(() => {
            this.setState({
                complete: true,
            }, () => {
                this.trigger('complete');
                props.onComplete.call(this, this);
            });
        }, props.completeDelay);
    }

    incompleteHelper() {
        this.trigger('incomplete');
        this.props.onIncomplete.call(this, this);
    }

    incomplete() {
        if (!this.state.complete || this.props.complete) return;

        this.setState({
            complete: false,
        }, this.incompleteHelper);
    }

    completeRefs() {
        this.invokeChildrenFunction('completeRefs');
        this.complete({silent: true});
    }

    incompleteRefs() {
        this.invokeChildrenFunction('incompleteRefs');
        this.incomplete();
    }

    readyHelper() {
        if (this.props.triggerReady) this.trigger('ready');
        if (this.state.open) this.start();
        if (_.isFunction(this.onReadyCallback)) {
            _.invoke(this, 'onReadyCallback.call', this);
            delete this.onReadyCallback;
        } else {
            _.invoke(this, 'onReady.call', this);
        }
        this.props.onReady.call(this);
    }

    ready() {
        this.setState({
            ready: true,
        }, this.readyHelper);
    }

    start(callback) {
        if (!this.state || !this.state.ready || this.state.started || !this.props.shouldStart) return;
        this.setState({
            started: true
        }, () => {
            this.checkComplete();
            this.invokeChildrenFunction('start');

            if (this.props.completeOnStart || this.props.complete) this.complete();

            this.props.onStart.call(this);

            if (typeof callback === 'function') callback.call(this);
        });
    }

    stopHelper() {
        this.invokeChildrenFunction('stop');
        this.props.onStop.call(this);
    }

    stop() {
        this.setState({
            started: false
        }, this.stopHelper);
    }

    pause() {
        this.invokeChildrenFunction('pause');
        this.props.onPause.call(this);
    }

    resume() {
        this.invokeChildrenFunction('resume');
        this.props.onResume.call(this);
    }

    openHelper() {
        this.props.onOpen.call(this);
    }

    open() {
        this.setState({
            open: true
        }, this.openHelper);
    }

    closeHelper() {
        this.props.onClose.call(this);
    }

    close() {
        this.setState({
            open: false
        }, this.closeHelper);
    }

    componentDidMount() {
        this.bootstrap();
    }

    bootstrap() {
        if (!this.props.bootstrap) return;

        if ((this.props.completeIncorrect && !this.props.correct) || this.props.complete) {
            this.complete();
        }

        this.collectMedia();
        this.checkReady();

        this.props.onBootstrap.call(this);
    }

    collectData() {
        return this.props.collectData.call(this);
    }

    loadData() {
        if (this.metaData) return this.props.loadData.call(this, this.metaData);
    }

    collectMediaHelper(ref, key) {
        if (ref instanceof skoash.Video) this.collectVideo(key);
        if (ref instanceof skoash.Audio) this.collectAudio(key);
        if (ref instanceof skoash.MediaSequence) this.collectMediaSequence(key);
    }

    collectMedia() {
        this.media = {
            video: [],
            audio: {
                background: [],
                sfx: [],
                voiceOver: [],
            },
            sequence: [],
        };

        _.each(this.refs, this.collectMediaHelper);
    }

    collectVideo(key) {
        if (!this.media[key]) this.media[key] = this.refs[key];
        if (!_.isFinite(key)) this.media.video[key] = this.refs[key];
        this.media.video.push(this.refs[key]);
    }

    collectAudio(key) {
        if (!this.media[key]) this.media[key] = this.refs[key];
        if (!this.media.audio[key]) this.media.audio[key] = this.refs[key];
        if (!_.isFinite(key)) {
            this.media.audio[this.refs[key].props.type][key] = this.refs[key];
        }
        if (this.refs[key].props.type) {
            this.media.audio[this.refs[key].props.type].push(this.refs[key]);
        }
    }

    collectMediaSequence(key) {
        if (!this.media[key]) this.media[key] = this.refs[key];
        if (!_.isFinite(key)) this.media.sequence[key] = this.refs[key];
        this.media.sequence.push(this.refs[key]);
    }

    playMedia(path) {
        _.invoke(this.media, path + '.play');
    }

    getUnready(ready = 'ready') {
        return _.reduce(this.refs, (a, v, k) => {
            if (v.state && !v.state[ready]) a[k] = v;
            return a;
        }, {});
    }

    checkReadyHelper(ref) {
        if (!_.get(ref, 'state.ready')) _.invoke(ref, 'checkReady');
    }

    checkReady() {
        var ready;

        if (!this.props.checkReady || (!this.props.ignoreReady && this.state.ready)) return;

        _.each(this.refs, this.checkReadyHelper);

        ready = !_.size(this.getUnready());

        if (ready) this.ready();
    }

    checkComplete() {
        var complete;

        if (!this.props.checkComplete || !this.state.ready) return;

        this.invokeChildrenFunction('checkComplete');

        complete = !_.size(this.getUnready('complete'));

        if (complete && !this.state.complete) {
            this.complete();
        } else if (this.state.started && !complete && this.state.complete) {
            this.incomplete();
        }
    }

    updateGameState(opts) {
        return this.trigger('updateState', opts);
    }

    updateGameData(opts) {
        return this.trigger('updateGameData', opts);
    }

    updateScreenData(opts) {
        return this.trigger('updateScreenData', opts);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.shouldComponentUpdate.call(this, nextProps, nextState);
    }

    componentWillReceiveProps(props) {
        if (props.complete === true && props.complete !== this.props.complete) {
            this.complete(props);
        }

        if (props.completeRefs === true && props.completeRef !== this.props.completeRef) {
            this.completeRefs();
        }

        if (props.incompleteRefs === true && props.incompleteRefs !== this.props.incompleteRefs) {
            this.incompleteRefs();
        }

        if (props.start === true && props.start !== this.props.start) {
            this.start();
        }

        if (props.stop === true && props.stop !== this.props.stop) {
            this.stop();
        }

        this.props.onComponentWillReceiveProps.call(this, props);
    }

    componentWillUnmount() {
        this.stop();
    }

    addClassName(className, callback) {
        if (this.state.className && this.state.className.indexOf(className) !== -1) return;
        this.setState({
            className: classNames(this.state.className, className),
        }, callback);
    }

    removeClassName(className, callback) {
        if (!this.state.className) return;
        this.setState({
            className: this.state.className.replace(className, ''),
        }, callback);
    }

    removeAllClassNames(callback) {
        this.setState({
            className: null
        }, callback);
    }

    getClassNamesHelper(a, v, k) {
        if (v === true) a[_.toUpper(k)] = v;
        return a;
    }

    getClassNames() {
        return classNames(
            _.reduce(this.state, this.getClassNamesHelper, {}),
            this.state.className,
            this.props.className,
            this.props.componentName,
            this.props.getClassNames.call(this)
        );
    }

    renderContentList(listName = 'children') {
        return _.map([].concat(this.props[listName]), (component, key) => {
            var gameState = component instanceof skoash.MediaSequence ? this.state : this.props.gameState;
            if (!component || !component.type) return;
            return (
                <component.type
                    gameState={gameState}
                    {...component.props}
                    ref={component.ref || (component.props && component.props['data-ref']) ||
                        listName + '-' + key}
                    key={key}
                />
            );
        });
    }

    render() {
        if (!this.props.shouldRender) return null;

        return (
            <this.props.type {...this.props} className={this.getClassNames()}>
                {this.renderContentList()}
            </this.props.type>
        );
    }
}

Component.defaultProps = {
    bootstrap: true,
    checkComplete: true,
    checkReady: true,
    collectData: _.noop,
    completeDelay: 0,
    completeIncorrect: false,
    completeOnStart: false,
    componentName: '',
    getClassNames: _.noop,
    ignoreReady: false,
    loadData: _.noop,
    onBootstrap: _.noop,
    onClose: _.noop,
    onComplete: _.noop,
    onComponentWillReceiveProps: _.noop,
    onReady: _.noop,
    onIncomplete: _.noop,
    onOpen: _.noop,
    onPause: _.noop,
    onResume: _.noop,
    onStart: _.noop,
    onStop: _.noop,
    shouldComponentUpdate: () => true,
    shouldRender: true,
    shouldStart: true,
    triggerReady: true,
    type: 'div',
};

export default Component;
