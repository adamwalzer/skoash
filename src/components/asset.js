import Component from './component.js';

/*
 * the Asset class is meant for all assets
 * for example images, and media (audio, video)
 */
class Asset extends Component {
    constructor(props) {
        super(props);

        this.state.ready = props.ready;

        this.error = this.error.bind(this);
    }

    error() {
        this.setState({
            error: true,
            ready: this.props.ready
        }, () => {
            this.props.onError.call(this);
        });
    }
}

Asset.defaultProps = _.defaults({
    checkComplete: false,
    checkReady: false,
    onError: _.noop,
    ready: false,
}, Component.defaultProps);

export default Asset;
