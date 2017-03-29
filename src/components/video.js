import Media from './media.js';

class Video extends Media {
    constructor(props) {
        super(props);

        this.play = this.play.bind(this);
    }

    play() {
        if (this.playing && !this.paused) return;
        /*
        * In order for videos to play on mobile devices,
        * the screen must have prop.startDelay=0
        */
        // this.video.play();
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
        // this.video.pause();
        skoash.trigger('videoStop', {
            video: this
        });
        this.playing = false;
    }

    pause() {
        // this.video.pause();
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

    bootstrap() {
        this.frame = ReactDOM.findDOMNode(this.refs.frame);
        // this.video.load();
        this.ready();
    }

    getStyle() {
        return {
            border: 0,
            pointerEvents: 'none',
        };
    }

    render() {
        return (
            <div>
                <iframe
                    ref="frame"
                    {...this.props}
                    style={this.getStyle()}
                />
            </div>
        );
    }
}

export default Video;
