import Media from './media';

class Video extends Media {
    constructor(props) {
        super(props);

        this.bootstrap = this.bootstrap.bind(this);
        this.play = this.play.bind(this);
        this.setDevice = this.setDevice.bind(this);
        this.onTimeUpdate = this.onTimeUpdate.bind(this);
        this.onSeeking = this.onSeeking.bind(this);
        this.onEnded = this.onEnded.bind(this);
        this.onClick = this.onClick.bind(this);
        this.attachOnEnded = this.attachOnEnded.bind(this);
        this.attachOnEndedHelper = this.attachOnEndedHelper.bind(this);
    }

    play() {
        if (!this.video) return;
        if (this.playing && !this.paused) return;
        /*
        * In order for videos to play on mobile devices,
        * the screen must have prop.startDelay=0
        */
        this.video.play();
        super.play();
        skoash.trigger('videoPlay', {
            video: this
        });
        this.playing = true;
        this.paused = false;
    }

    start() {
        this.play();
    }

    stop() {
        if (!this.video) return;
        this.video.pause();
        skoash.trigger('videoStop', {
            video: this
        });
        this.playing = false;
    }

    pause() {
        if (!this.video) return;
        this.video.pause();
        this.paused = true;
    }

    resume() {
        this.play();
    }

    complete() {
        if (!this.props.loop) {
            skoash.trigger('videoStop', {
                video: this
            });
        }

        this.playing = false;

        super.complete();
    }

    onClick() {
        this.popup = window.open(this.props.popup);
        this.attachOnEnded();
    }

    attachOnEnded() {
        setTimeout(this.attachOnEndedHelper, 1000);
    }

    attachOnEndedHelper() {
        try {
            this.popup.document.getElementById('video').onended = this.complete;
        } catch(err) {
            this.attachOnEnded();
        }
    }

    setDevice(gameState) {
        this.mobile = gameState.mobile;
        this.iOS = gameState.iOS;

        this.setState({ready: true});
        this.forceUpdate(this.bootstrap);
    }

    componentWillMount() {
        skoash.trigger('getState').then(this.setDevice);
    }

    onTimeUpdate() {
        if (!this.video.seeking) {
            this.currentTime = this.video.currentTime || 0;
        }
    }

    onSeeking() {
        let delta = this.video.currentTime - this.currentTime;
        if (delta > 0) {
            this.video.currentTime = this.currentTime || 0;
        }
    }

    onEnded() {
        this.currentTime = 0;
    }

    bootstrap() {
        this.video = ReactDOM.findDOMNode(this.refs.video);

        if (!this.video) return;

        this.video.load();

        if (!this.props.allowSeeking) {
            this.currentTime = 0;
            this.video.addEventListener('timeupdate', this.onTimeUpdate);
            this.video.addEventListener('seeking', this.onSeeking);
            this.video.addEventListener('ended', this.onEnded);
        }
    }

    componentWillUnmount() {
        if (!this.video) return;
        if (!this.props.allowSeeking) {
            this.video.removeEventListener('timeupdate', this.onTimeUpdate);
            this.video.removeEventListener('seeking', this.onSeeking);
            this.video.removeEventListener('ended', this.onEnded);
        }
    }

    render() {
        if (this.iOS !== false) {
            return (
                <div
                    className="video-placeholder"
                    onClick={this.onClick}
                >
                    {this.props.copy}
                </div>
            );
        }

        return (
            <video
                {...this.props}
                ref="video"
                onCanPlay={this.ready}
                onEnded={this.complete}
                preload="auto"
                controls={true}
            />
        );
    }
}

Video.defaultProps = _.defaults({
    popup: 'video.html',
    copy: 'Click here to view video!',
    allowSeeking: false,
}, Media.defaultProps);

export default Video;
