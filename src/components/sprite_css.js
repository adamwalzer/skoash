import Component from 'components/component';
import JSON from 'components/json';
import Image from 'components/image';

class Sprite extends Component {
    constructor(props) {
        super(props);

        this.state = _.defaults({
            styleText: '',
        }, this.state);

        this.onJSONReady = this.onJSONReady.bind(this);
    }

    onJSONReady() {
        this.data = this.refs.json.getData();
        this.setUp();
    }

    setUp() {
        if (this.data && this.data.frames) {
            let minX = _.reduce(this.data.frames, (a, v) => Math.min(a, v.spriteSourceSize.x), Infinity);
            let minY = _.reduce(this.data.frames, (a, v) => Math.min(a, v.spriteSourceSize.y), Infinity);
            let maxWidth = _.reduce(this.data.frames, (a, v) =>
                Math.max(a, v.spriteSourceSize.x + v.spriteSourceSize.w - minX), 0);
            let maxHeight = _.reduce(this.data.frames, (a, v) =>
                Math.max(a, v.spriteSourceSize.y + v.spriteSourceSize.h - minY), 0);

            let styleText = `${this.props.spriteSelector}` +
                `{ display: inline-block; width: ${maxWidth}px; height: ${maxHeight}px }`;

            styleText = _.reduce(this.data.frames, (text, frameData, k) => {
                let selector = this.props.frameSelectors[k] || `.frame-${k}::before`;
                let rules = {
                    position: 'absolute',
                    top: `${frameData.spriteSourceSize.y - minY}px`,
                    left: `${frameData.spriteSourceSize.x - minX}px`,
                    backgroundImage: `url(${this.props.src}.${this.props.extension})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `-${frameData.frame.x}px -${frameData.frame.y}px`,
                    backgroundSize: `${this.data.meta.size.w}px ${this.data.meta.size.h}px`,
                    width: `${frameData.frame.w}px`,
                    height: `${frameData.frame.h}px`,
                    content: '\'\'',
                };
                text += `${this.props.spriteSelector}${selector} {`;
                text = _.reduce(rules, (a, v, i) => {
                    a += `${_.kebabCase(i)}: ${v};`;
                    return a;
                }, text);
                text += '}';
                return text;
            }, styleText);

            this.setState({
                styleText
            }, () => {
                this.props.onSetUp.call(this);
            });
        }
    }

    renderJSON() {
        return (
            <JSON
                ref="json"
                src={`${this.props.dataSrc || this.props.src}.${this.props.dataExtension}`}
                onReady={this.onJSONReady}
            />
        );
    }

    renderImage() {
        return (
            <Image
                ref="image"
                src={`${this.props.dataSrc || this.props.src}.${this.props.extension}`}
            />
        );
    }

    renderCSS() {
        return (
            <style>
                {this.state.styleText}
            </style>
        );
    }

    render() {
        return (
            <div
                {...this.props}
                style={{display: 'none'}}
            >
                {this.renderJSON()}
                {this.renderImage()}
                {this.renderCSS()}
            </div>
        );
    }
}

Sprite.defaultProps = _.defaults({
    src: '',
    dataSrc: '',
    extension: 'png',
    dataExtension: 'json',
    spriteSelector: '.css-sprite',
    frameSelectors: {},
    onSetUp: _.noop,
}, Component.defaultProps);

export default Sprite;
