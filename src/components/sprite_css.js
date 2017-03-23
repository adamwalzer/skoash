import Component from 'components/component';
import JSON from 'components/json';
import Image from 'components/image';

class SpriteCss extends Component {
    constructor(props) {
        super(props);

        this.state = _.defaults({
            styleText: '',
        }, this.state);

        this.onJSONReady = this.onJSONReady.bind(this);
        this.postSetUp = this.postSetUp.bind(this);
        this.minXHelper = this.minXHelper.bind(this);
        this.minYHelper = this.minYHelper.bind(this);
        this.maxWidthsHelper = this.maxWidthsHelper.bind(this);
        this.maxHeightsHelper = this.maxHeightsHelper.bind(this);
        this.styleTextHelper = this.styleTextHelper.bind(this);
    }

    onJSONReady() {
        this.data = this.refs.json.getData();
        this.setUp();
    }

    postSetUp() {
        this.props.onSetUp.call(this);
    }

    minXHelper(a, v, k) {
        let i = Math.floor(k / this.spriteGroup);
        let curr = i >= a.length ? Infinity : a[i];
        a[i] = Math.min(curr, v.spriteSourceSize.x);
        return a;
    }

    minYHelper(a, v, k) {
        let i = Math.floor(k / this.spriteGroup);
        let curr = i >= a.length ? Infinity : a[i];
        a[i] = Math.min(curr, v.spriteSourceSize.y);
        return a;
    }

    maxWidthsHelper(a, v, k) {
        let i = Math.floor(k / this.spriteGroup);
        let curr = i >= a.length ? 0 : a[i];
        a[i] = Math.max(curr, v.spriteSourceSize.x + v.spriteSourceSize.w - this.minXs[i]);
        return a;
    }

    maxHeightsHelper(a, v, k) {
        let i = Math.floor(k / this.spriteGroup);
        let curr = i >= a.length ? 0 : a[i];
        a[i] = Math.max(curr, v.spriteSourceSize.y + v.spriteSourceSize.h - this.minYs[i]);
        return a;
    }

    styleTextHelper(text, frameData, k) {
        return (
            text +
            `.${this.props.spriteClass}` +
            `${(this.props.frameSelectors[k] || `.frame-${k}`)} {` +
            `width: ${this.maxWidths[Math.floor(k / this.spriteGroup)]}px;` +
            `height: ${this.maxHeights[Math.floor(k / this.spriteGroup)]}px;` +
            '}' +
            `.${this.props.spriteClass}` +
            `${(this.props.frameSelectors[k] || `.frame-${k}`) + '::before'} {` +
            'position: absolute;' +
            `top: ${frameData.spriteSourceSize.y - this.minYs[Math.floor(k / this.spriteGroup)]}px;` +
            `left: ${frameData.spriteSourceSize.x - this.minXs[Math.floor(k / this.spriteGroup)]}px;` +
            `background-image: url(${this.props.src}.${this.props.extension});` +
            'background-repeat: no-repeat;' +
            `background-position: -${frameData.frame.x}px -${frameData.frame.y}px;` +
            `background-size: ${this.data.meta.size.w}px ${this.data.meta.size.h}px;` +
            `width: ${frameData.frame.w}px;` +
            `height: ${frameData.frame.h}px;` +
            'content: \'\';' +
            '}'
        );
    }

    setUp() {
        if (this.data && this.data.frames) {
            let styleText;

            this.spriteGroup = Math.min(this.props.spriteGroup, this.data.frames.length);
            this.minXs = _.reduce(this.data.frames, this.minXHelper, []);
            this.minYs = _.reduce(this.data.frames, this.minYHelper, []);
            this.maxWidths = _.reduce(this.data.frames, this.maxWidthsHelper, []);
            this.maxHeights = _.reduce(this.data.frames, this.maxHeightsHelper, []);

            styleText = `.${this.props.spriteClass}` +
                '{ display: inline-block; position: relative; }';

            styleText = _.reduce(this.data.frames, this.styleTextHelper, styleText);

            this.setState({
                styleText
            }, this.postSetUp);
        }
    }

    renderJSON() {
        return (
            <JSON
                ref="json"
                src={`${this.props.dataSrc || this.props.src}.${this.props.dataExtension}`}
                dataTarget={this.props.dataTarget}
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

SpriteCss.defaultProps = _.defaults({
    src: '',
    dataSrc: '',
    extension: 'png',
    dataExtension: 'json',
    spriteClass: 'css-sprite',
    frameSelectors: {},
    onSetUp: _.noop,
    spriteGroup: Infinity,
}, Component.defaultProps);

export default SpriteCss;
