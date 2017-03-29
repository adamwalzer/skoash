import Component from './component';

/*
 * the Asset class is meant for all assets
 * for example images, and media (audio, video)
 */
class Asset extends Component {
    constructor(props) {
        super(props);

        this.state.ready = props.ready;

        this.error = this.error.bind(this);
        this.errorHelper = this.errorHelper.bind(this);
    }

    errorHelper() {
        this.props.onError.call(this);
    }

    error() {
        this.setState({
            error: true,
            ready: this.props.ready
        }, this.errorHelper);
    }
}

Asset.defaultProps = _.defaults({
    checkComplete: false,
    checkReady: false,
    onError: _.noop,
    ready: false,
}, Component.defaultProps);

export default Asset;
