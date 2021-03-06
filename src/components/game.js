import classNames from 'classnames';

import EventManager from 'helpers/event_manager';
import DeviceDetector from 'helpers/device_detector';
import MediaManager from 'helpers/media_manager';
import Navigator from 'helpers/navigator';

import Component from 'components/component';
import Screen from 'components/screen';

class Game extends Component {
    constructor(props = {}) {
        super(props);

        this.state = {
            currentScreenIndex: 0,
            highestScreenIndex: 0,
            screenIndexArray: [],
            playingSFX: [],
            playingVO: [],
            playingBKG: [],
            playingVideo: null,
            openMenus: [],
            loading: true,
            demo: false,
            data: {},
            content: props.content,
            classes: [],
            screenLoads: {},
        };

        /* eslint-disable no-console */
        console.log(props.config);
        /* eslint-enable no-console */

        this.state.data.screens = _.map(props.screens, () => ({}) );

        this.screensLength = Object.keys(props.screens).length;

        this.eventManager = new EventManager(this);
        this.deviceDetector = new DeviceDetector(this);
        this.mediaManager = new MediaManager(this);
        this.navigator = new Navigator(this);

        this.readyHelper = this.readyHelper.bind(this);
        this.renderScreensHelper = this.renderScreensHelper.bind(this);
        this.renderMenuScreensHelper = this.renderMenuScreensHelper.bind(this);
    }

    getState(opts = {}) {
        _.invoke(opts, 'respond', this.state);
    }

    demo() {
        this.setState({
            demo: !this.state.demo,
        });
    }

    componentWillMount() {
        this.eventManager.emit({
            name: 'init',
        });
        this.deviceDetector.detechDevice();
        this.scale();
    }

    bootstrap() {
        if (!this.state.iOS) {
            this.setState({
                currentScreenIndex: 1,
            });
        }

        this.collectMedia();
        this.navigator.loadScreens(this.state.currentScreenIndex, false);

        this.DOMNode = ReactDOM.findDOMNode(this);

        this.props.onBootstrap.call(this);
    }

    readyHelper() {
        this.eventManager.emit({
            name: 'ready',
            game: this.props.config.id,
        });
        this.navigator.goto({
            index: this.state.currentScreenIndex,
            silent: true,
        });
        this.onReady.call(this);
        this.props.onReady.call(this);
    }

    ready() {
        if (this.state.ready || this.isReady) return;
        this.isReady = true;
        this.setState({
            ready: true,
        }, this.readyHelper);
    }

    resume() {
        if (this.state.playingVO.length) this.mediaManager.fadeBackground();
        this.setPause(false);
    }

    pause() {
        this.setPause(true);
    }

    // paused should be a boolean determining whether to call
    // audio.pause or audio.resume
    setPause(paused) {
        var fnKey = paused ? 'pause' : 'resume';

        this.setState({
            paused
        }, () => {
            _.each(this.state.playingBKG, audio => _.invoke(audio, fnKey));
            _.invoke(this.refs['screen-' + this.state.currentScreenIndex], fnKey);
        });
    }

    // Remove this method after refactoring games that override it.
    // all-about-you, polar-bear, tag-it
    getBackgroundIndex(index, id) {
        return this.props.getBackgroundIndex.call(this, index, id);
    }

    scale() {
        this.setState({
            scale: window.innerWidth / this.props.config.dimensions.width,
        });
    }

    // remove once games are refactored to call this.eventManager.emit(gameData);
    // all-about-you
    emit(gameData = {}) {
        return this.eventManager.emit(gameData);
    }

    getGame(opts) {
        if (this.props.config.id === opts.id) _.invoke(opts, 'respond', this);
    }

    getData(opts) {
        this.props.getData.call(this, opts);
    }

    passData(opts) {
        if (typeof opts.respond === 'function') {
            opts.respond(this.props.passData.apply(this, arguments));
        } else {
            return this.props.passData.apply(this, arguments);
        }
    }

    load(opts) {
        if (opts.game === this.props.config.id &&
            opts.version === this.props.config.version &&
            opts.highestScreenIndex) {
            if (opts.highestScreenIndex === this.screensLength - 1) return;
            this.navigator.loadScreens(opts.highestScreenIndex);
        }
    }

    quit() {
        this.eventManager.emit({
            name: 'exit',
            game: this.props.config.id,
        });
    }

    updateState(opts) {
        if (typeof opts.path === 'string') {
            /* eslint-disable no-console */
            console.warn('As of skoash 1.1.1 please trigger updateScreenData directly');
            /* eslint-enable no-console */
            this.updateScreenData(opts);
        } else if (_.isArray(opts.path)) {
            /* eslint-disable no-console */
            console.warn('As of skoash 1.1.1 please trigger updateGameData directly');
            /* eslint-enable no-console */
            this.updateGameData(opts);
        }
    }

    updateGameData(opts) {
        var keys = opts.keys || opts.key || opts.path;
        if (keys) opts.data = _.setWith({}, keys, opts.data, Object);
        this.updateData(opts);
    }

    updateScreenData(opts) {
        opts.keys = _.filter(
            ['screens', this.state.currentScreenIndex]
            .concat(opts.keys)
            .concat(opts.key || opts.path),
            _.identity
        );
        this.updateGameData(opts);
    }

    updateData(opts) {
        var data = _.merge(this.state.data, opts.data);

        this.setState({
            data,
        }, () => {
            _.invoke(opts.callback, 'call', this);
        });
    }

    checkComplete() {
        _.invoke(this.refs['screen-' + this.state.currentScreenIndex], 'checkComplete');
    }

    // this method takes in an opts parameter object with screenID
    screenComplete(opts) {
        this.props.screenComplete.call(this, opts);
    }

    getCurrentScreen() {
        return this.refs[`screen-${this.state.currentScreenIndex}`];
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);

        if (props.screens && props.screens !== this.props.screens) {
            this.screensLength = Object.keys(props.screens).length;
        }

        if (props.content && props.content !== this.props.content) {
            this.setState({content: props.content});
        }
    }

    getClassNames() {
        var screen = this.refs['screen-' + this.state.currentScreenIndex];
        var screenClass = screen ? 'SCREEN-' + screen.props.id : '';

        return classNames(
            'pl-game',
            {
                SFX: this.state.playingSFX.length,
                'VOICE-OVER': this.state.playingVO.length,
                MENU: this.state.openMenus.length,
                ['MENU-' + this.state.openMenus[0]]: this.state.openMenus[0],
            },
            'SCREEN-' + this.state.currentScreenIndex,
            screenClass,
            ...this.state.classes,
            super.getClassNames()
        );
    }

    getStyles() {
        var transform = `scale3d(${this.state.scale},${this.state.scale},1)`;
        var transformOrigin = this.state.scale < 1 ? '0px 0px 0px' : '50% 0px 0px';

        return {
            transform,
            WebkitTransform: transform,
            transformOrigin,
            WebkitTransformOrigin: transformOrigin,
        };
    }

    renderScreensHelper(key, index) {
        // data will eventually be removed from screen props
        // in favor of passing it in as a param to the screen function
        let data = this.state.data.screens[key];
        let props = _.defaults({
            data,
            load: this.state.screenLoads[key],
            prevButtonClassName: _.isString(this.props.prevButtonClassName) ?
                this.props.prevButtonClassName : this.props.prevButtonClassName[key],
            nextButtonClassName: _.isString(this.props.nextButtonClassName) ?
                this.props.nextButtonClassName : this.props.nextButtonClassName[key],
            // gameState will eventually be removed from screen props
            // in favor of passing it in as a param to the screen function
            gameState: this.state,
            index,
        }, this.props.screens[key].props);

        if (
            !props.load &&
            _.isNumber(_.parseInt(key)) &&
            Math.abs(this.state.currentScreenIndex - index) > this.props.screenBufferAmount
        ) {
            return null;
        }

        return this.props.screens[key](
            props,
            `screen-${key}`,
            key,
            _.get(this, `state.content.screens.${key}`),
            this.state,
            data
        );
    }

    renderScreens() {
        return _.map(Object.keys(this.props.screens), this.renderScreensHelper);
    }

    renderMenuScreensHelper(Menu, key) {
        return (
            <Menu.type
                {...Menu.props}
                gameState={this.state}
                key={key}
                index={key}
                ref={`menu-${key}`}
            />
        );
    }

    renderMenuScreens() {
        return _.map(this.props.menus, this.renderMenuScreensHelper);
    }

    render() {
        return (
            <div className={this.getClassNames()} style={this.getStyles()}>
                {this.renderContentList('assets')}
                {this.props.renderMenu.call(this)}
                {this.renderScreens()}
                {this.renderMenuScreens()}
                {this.props.renderExtras.call(this)}
                {this.renderContentList('loader')}
            </div>
        );
    }
}

Game.defaultProps = _.defaults({
    componentName: 'skoash-game',
    getBackgroundIndex: () => 0,
    passData: _.noop,
    screenBufferAmount: 3,
    screens: [
        /* eslint-disable no-unused-vars */
        /* This is disabled to show the available params even though they're not being used */
        function (props, ref, key, content, gameState, data) {
            return (
                <Screen
                    {...props}
                    ref={ref}
                    key={key}
                />
            );
        },
        /* eslint-enable no-unused-vars */
    ],
    menus: {
        Screen
    },
    ignoreReady: true,
    renderMenu: function () {
        return (
            <div className="menu">
                <button
                    className={classNames('navigation', 'close', this.props.closeButtonClassName)}
                    onClick={this.navigator.openMenu.bind(this, {id: 'quit'})}
                />
            </div>
        );
    },
    renderExtras: _.noop,
    getGotoOpts: _.identity, // don't change to _.noop
    getTriggerEvents: _.identity, // don't change to _.noop
    triggerReady: false,
    getData: function (opts) {
        opts.name = 'getData';
        return this.eventManager.emit(opts);
    },
    prevButtonClassName: '',
    nextButtonClassName: '',
    screenComplete: function (opts) {
        let screen = this.getCurrentScreen();

        if (opts.silent || !screen || screen.props.id !== opts.screenID) return;

        this.playMedia('screen-complete');
    },
}, Component.defaultProps);

export default Game;
