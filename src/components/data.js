import Component from './component';
import util from 'methods/util';

class Data extends Component {
    constructor(props) {
        super(props);

        this.state.ready = false;

        this.loadFile = util.loadFile;
        this.loadData(props.src);

        this.loadDataHelper = this.loadDataHelper.bind(this);
    }

    loadDataHelper(data) {
        this.data = data;
        this.ready();
        if (this.props.dataTarget) {
            this.updateGameData({
                key: this.props.dataTarget,
                data,
            });
        }
    }

    loadData(src) {
        this.loadFile(src, this.loadDataHelper);
    }

    getData() {
        return this.data;
    }
}

Data.defaultProps = _.defaults({
    src: '',
    complete: true,
    checkReady: false,
    checkComplete: false,
    shouldRender: false,
}, Component.defaultProps);

export default Data;
