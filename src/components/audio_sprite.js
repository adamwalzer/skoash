import { Howl } from 'howler';
import Audio from './audio';
// named this way to prevent namespace collision
import Json from './json';

class AudioSprite extends Audio {
    constructor(props) {
        super(props);

        this.onJSONReady = this.onJSONReady.bind(this);
    }

    onJSONReady() {
        this.data = this.refs.json.getData();
        if (_.isString(this.data)) this.data = JSON.parse(this.data);
        this.setUp();
    }

    complete() {
        this.spriteComplete[this.props.play] = true;
        this.playing = false;

        if (!_.includes(this.spriteComplete, false)) super.complete();
    }

    setUp() {
        let src = _.map(this.data.resources, resource =>
            `${this.props.srcFolder}${resource}`
        );

        let format = _.map(this.data.resources, resource =>
            _.nth(_.split(resource, '.'), 1)
        );

        let sprite = _.reduce(this.data.spritemap, (a, v, k) => {
            a[k] = [v.start * 1000, (v.end - v.start) * 1000];
            return a;
        }, {});

        this.spriteComplete = {};

        if (_.isBoolean(this.props.complete)) {
            this.spriteComplete = _.reduce(this.data.spritemap, (a, v, k) => {
                a[k] = this.props.complete || false;
                return a;
            }, {});
        } else if (_.isObject(this.props.complete)) {
            this.spriteComplete = _.reduce(this.data.spritemap, (a, v, k) => {
                a[k] = this.props.complete[k] || false;
                return a;
            }, {});
        }

        this.audio = new Howl({
            src,
            format,
            sprite,
            loop: this.props.loop,
            volume: this.props.volume,
            onend: this.complete,
            onload: this.ready,
            rate: this.props.rate,
        });

        if (this.props.complete === true) this.complete();
    }

    bootstrap() {
        this.props.onBootstrap.call(this);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);

        if (props.play != null && props.play !== this.props.play) {
            this.sprite = props.play;
            this.play(props.play);
        }

        if (props.stop != null && props.stop !== this.props.stop) {
            this.sprite = props.stop;
            this.stop(props.stop);
        }
    }

    render() {
        return (
            <Json
                ref="json"
                style={{display: 'none'}}
                src={`${this.props.srcFolder}${this.props.dataSrc}`}
                onReady={this.onJSONReady}
            />
        );
    }
}

AudioSprite.defaultProps = _.defaults({
    srcFolder: '',
    dataSrc: '',
    complete: false,
}, Audio.defaultProps);

export default AudioSprite;
