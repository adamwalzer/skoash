import classNames from 'classnames';

import Component from 'components/component';
import SpriteCss from 'components/sprite_css';

class Animation extends Component {
    constructor(props) {
        super(props);

        this.state = _.defaults({
            frame: props.frame,
        }, this.state);

        this.lastAnimation = Date.now();

        this.setUp = this.setUp.bind(this);
    }

    setUp(frames) {
        this.frameRates = _.isArray(this.props.duration) ? this.props.duration :
            _.fill(Array(frames), this.props.duration / frames);
    }

    animate(i = 1) {
        const NOW = Date.now();

        if (this.props.pause || this.state.paused || !this.state.started) return;

        if (!this.props.loop) {
            if (this.props.animateBackwards) {
                if (this.state.frame === 0) {
                    this.complete();
                    return;
                }
            }

            if (this.state.frame === this.props.frames - 1) {
                this.complete();
                return;
            }
        }

        if (NOW > this.lastAnimation + this.frameRates[this.state.frame]) {
            let frame = (this.state.frame + i + this.props.frames) % this.props.frames;
            this.lastAnimation = NOW;
            if (frame === 0) this.props.onLoop.call(this);
            this.setState({
                frame
            });
        }

        window.requestAnimationFrame(() => {
            this.animate(i);
        });
    }

    start() {
        super.start(() => {
            if (this.props.animate) this.animate();
        });
    }

    pause() {
        super.pause();
        this.setState({ paused: true });
    }

    resume() {
        super.resume();
        this.setState({ paused: false }, () => {
            if (this.props.animate) this.animate();
            else if (this.props.animateBackwards) this.animate(-1);
        });
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);

        if (props.frame !== this.props.frame) {
            this.setState({ frame: props.frame });
        }

        if (props.frames !== this.props.frames) {
            this.setUp(props.frames);
        }

        if (props.animate && props.animate !== this.props.animate) {
            this.animate();
        } else if (props.animateBackwards && props.animateBackwards !== this.props.animateBackwards) {
            this.animate(-1);
        }
    }

    getClassNames() {
        return classNames(
            this.props.spriteClass,
            this.props.frameSelectors[this.state.frame] || `frame-${this.state.frame}`,
            super.getClassNames()
        );
    }

    render() {
        return (
            <div {...this.props} >
                <SpriteCss
                    ref="css"
                    onSetUp={this.setUp}
                    src={this.props.src}
                    dataSrc={this.props.dataSrc}
                    extension={this.props.extension}
                    dataExtension={this.props.dataExtension}
                    spriteSelector={this.props.spriteSelector}
                    frameSelectors={this.props.frameSelectors}
                />
                <div
                    ref="sprite"
                    className={this.getClassNames()}
                />
            </div>
        );
    }
}

Animation.defaultProps = _.defaults({
    src: '',
    dataSrc: '',
    extension: 'png',
    dataExtension: 'json',
    spriteClass: 'css-sprite',
    frameSelectors: {},
    duration: 1000,
    frame: 0,
    frames: 1,
    hoverFrame: null,
    pause: false,
    loop: true,
    animate: false,
    animateBackwards: false,
    onLoop: _.noop,
    onUpdate: _.noop,
}, Component.defaultProps);

export default Animation;
