import { Howl } from 'howler';
import Media from './media';

class Audio extends Media {
    constructor(props) {
        super(props);

        this.allowMultiPlay = props.allowMultiPlay || props.type === 'sfx';

        this.play = _.throttle(this.play.bind(this), props.playThrottle);
        this.playHelper = this.playHelper.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.resumeHelper = this.resumeHelper.bind(this);
    }

    playHelper(state) {
        if (!this.state.ready) {
            this.bootstrap();
        } else {
            this.trigger('audioPlay', {
                audio: this
            });
            this.delayed = true;

            if (!state.paused) {
                this.timeout = setTimeout(this.playAudio, this.props.delay);
            }
        }
    }

    play() {
        this.trigger('getState').then(this.playHelper);
    }

    playAudio(resume) {
        if (this.paused) return;
        if (!resume && !this.allowMultiPlay && this.playing) return;

        this.delayed = false;
        this.playing = true;

        _.invoke(this, 'audio.play', this.sprite);
        super.play();
    }

    pause() {
        if (this.delayed) {
            clearTimeout(this.timeout);
        }

        if (!this.playing) return;
        _.invoke(this, 'audio.pause');
        this.paused = true;
    }

    resumeHelper(state) {
        if (state.paused) return;

        if (this.delayed) {
            this.timeout = setTimeout(
                this.playAudio,
                this.props.delay
            );
        }

        if (!this.paused) return;
        this.paused = false;
        this.playAudio(true);
    }

    resume() {
        this.trigger('getState').then(this.resumeHelper);
    }

    stop() {
        if (this.delayed && this.timeout) {
            clearTimeout(this.timeout);
        }

        if (!this.playing && !this.delayed) return;
        if (!this.audio) return;

        this.playing = false;
        this.paused = false;

        _.invoke(this, 'audio.stop', this.sprite);

        this.trigger('audioStop', {
            audio: this
        });
    }

    setVolume(volume) {
        volume = Math.min(this.props.maxVolume,
            Math.max(this.props.minVolume, volume));
        _.invoke(this, 'audio.volume', volume);
    }

    increaseVolume(volume) {
        if (!this.playing) return;
        volume = Math.min(volume || this.props.volume, this.props.maxVolume);
        _.invoke(this, 'audio.fadeIn', volume);
    }

    decreaseVolume(volume) {
        if (!this.playing) return;
        volume = Math.max(volume, this.props.minVolume);
        _.invoke(this, 'audio.fadeOut', volume);
    }

    complete(props) {
        props = _.defaults(props || {}, this.props);

        if (!props.loop) {
            this.playing = false;
            this.trigger('audioStop', {
                audio: this
            });
        }

        if (!props.complete && this.paused) return;

        super.complete();
    }

    bootstrap() {
        this.load();
        if (this.props.complete) this.complete();
    }

    load() {
        let sprite = this.props.sprite ? {sprite: this.props.sprite} : undefined;

        this.sprite = this.props.sprite ? 'sprite' : undefined;

        if (this.audio) return;

        this.audio = new Howl({
            src: [].concat(this.props.src),
            format: [].concat(this.props.format),
            loop: this.props.loop,
            volume: this.props.volume,
            onend: this.complete,
            onload: this.ready,
            rate: this.props.rate,
            sprite,
        });
    }

    unload() {
        this.playing = false;
        this.paused = false;
        this.trigger('audioStop', {
            audio: this
        });

        if (!this.audio) return;

        _.invoke(this, 'audio.stop', this.sprite);
        _.invoke(this, 'audio.unload');

        delete this.audio;
        this.setState({ready: this.props.ready || false});
    }

    componentWillUnmount() {
        this.unload();
    }

    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);

        if (nextProps.volume !== null && nextProps.volume !== this.props.volume) {
            this.setVolume(nextProps.volume);
        }
    }
}

Audio.defaultProps = _.defaults({
    type: 'sfx',
    format: 'mp3',
    delay: 0,
    rate: 1,
    loop: false,
    volume: 1,
    maxVolume: 1,
    minVolume: 0,
    playThrottle: 100,
    shouldRender: false,
    sprite: undefined,
    allowMultiPlay: false,
    unloadIndex: Infinity,
    loadIndex: 0,
}, Media.defaultProps);

export default Audio;
