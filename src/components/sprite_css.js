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
    }

    onJSONReady() {
        this.data = this.refs.json.getData();
        this.setUp();
    }

    setUp() {
        if (this.data && this.data.frames) {
            let spriteGroup = Math.min(this.props.spriteGroup, this.data.frames.length);
            let minXs = _.reduce(this.data.frames, (a, v, k) => {
                let i = Math.floor(k / spriteGroup);
                let curr = i >= a.length ? Infinity : a[i];
                a[i] = Math.min(curr, v.spriteSourceSize.x);
                return a;
            }, []);
            let minYs = _.reduce(this.data.frames, (a, v, k) => {
                let i = Math.floor(k / spriteGroup);
                let curr = i >= a.length ? Infinity : a[i];
                a[i] = Math.min(curr, v.spriteSourceSize.y);
                return a;
            }, []);
            let maxWidths = _.reduce(this.data.frames, (a, v, k) => {
                let i = Math.floor(k / spriteGroup);
                let curr = i >= a.length ? 0 : a[i];
                a[i] = Math.max(curr, v.spriteSourceSize.x + v.spriteSourceSize.w - minXs[i]);
                return a;
            }, []);
            let maxHeights = _.reduce(this.data.frames, (a, v, k) => {
                let i = Math.floor(k / spriteGroup);
                let curr = i >= a.length ? 0 : a[i];
                a[i] = Math.max(curr, v.spriteSourceSize.y + v.spriteSourceSize.h - minYs[i]);
                return a;
            }, []);

            let styleText = `.${this.props.spriteClass}` +
                '{ display: inline-block; position: relative; }';

            styleText = _.reduce(this.data.frames, (text, frameData, k) =>
                text +
                `.${this.props.spriteClass}` +
                `${(this.props.frameSelectors[k] || `.frame-${k}`)} {` +
                `width: ${maxWidths[Math.floor(k / spriteGroup)]}px;` +
                `height: ${maxHeights[Math.floor(k / spriteGroup)]}px;` +
                '}' +
                `.${this.props.spriteClass}` +
                `${(this.props.frameSelectors[k] || `.frame-${k}`) + '::before'} {` +
                'position: absolute;' +
                `top: ${frameData.spriteSourceSize.y - minYs[Math.floor(k / spriteGroup)]}px;` +
                `left: ${frameData.spriteSourceSize.x - minXs[Math.floor(k / spriteGroup)]}px;` +
                `background-image: url(${this.props.src}.${this.props.extension});` +
                'background-repeat: no-repeat;' +
                `background-position: -${frameData.frame.x}px -${frameData.frame.y}px;` +
                `background-size: ${this.data.meta.size.w}px ${this.data.meta.size.h}px;` +
                `width: ${frameData.frame.w}px;` +
                `height: ${frameData.frame.h}px;` +
                'content: \'\';' +
                '}'
            , styleText);

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
                dataTarget={this.props.dataTarget}
                onReady={this.onJSONReady}
            />
        );
    }

    renderImage() {
        return (
            <Image
                ref="image"
                src={`${this.props.src}.${this.props.extension}`}
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
