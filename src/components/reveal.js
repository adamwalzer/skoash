import classNames from 'classnames';

import Component from 'components/component';

class Reveal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            openReveal: '',
            currentlyOpen: []
        };

        this.index = 0;

        this.close = this.close.bind(this);
        this.renderListHelper = this.renderListHelper.bind(this);
    }

    incomplete() {
        this.setState({
            openReveal: '',
            currentlyOpen: []
        });

        super.incomplete();
    }

    open(message) {
        var currentlyOpen = this.props.openMultiple ?
            this.state.currentlyOpen.concat(message) : [message];

        this.setState({
            open: true,
            openReveal: message,
            currentlyOpen,
        });

        this.playMedia('open-sound');

        if (this.props.completeOnOpen) {
            this.complete();
        } else {
            _.each(this.refs, (ref, key) => {
                if (key === message) _.invoke(ref, 'complete');
            });
        }

        if (this.props.autoClose) {
            setTimeout(this.close, 2000);
        }

        if (this.props.openTarget) {
            this.updateScreenData({
                key: this.props.openTarget,
                data: {
                    open: '' + message,
                    close: false,
                }
            });
        }

        this.props.onOpen.call(this, message);
    }

    close(opts = {}) {
        var prevMessage;
        var currentlyOpen;
        var openReveal;
        var open;

        prevMessage = this.state.openReveal;
        currentlyOpen = this.state.currentlyOpen || [];
        currentlyOpen.splice(currentlyOpen.indexOf(prevMessage), 1);
        open = currentlyOpen.length > 0;
        openReveal = open ? currentlyOpen[currentlyOpen.length - 1] : '';

        this.setState({
            open,
            openReveal,
            currentlyOpen,
        });

        if (!opts.silent) this.playMedia('close-sound');

        if (this.props.openTarget) {
            this.updateScreenData({
                key: this.props.openTarget,
                data: {
                    open: null,
                    close: false,
                }
            });
        }

        this.props.onClose.call(this, prevMessage);
    }

    start() {
        super.start();

        if (this.props.prevButtonClassName) {
            console.warn('As of skoash 1.1.7, closeButtonClassName prop should be used');
        }

        if (this.props.openOnStart != null) {
            this.open(this.props.openOnStart);
        } else if (this.props.start && typeof this.props.start === 'function') {
            this.props.start.call(this);
        } else {
            this.close({silent: true});
        }
    }

    renderAssetsHelper(asset, key) {
        var ref = asset.ref || asset.props['data-ref'] || 'asset-' + key;
        return (
            <asset.type
                {...asset.props}
                data-ref={key}
                ref={ref}
                key={key}
            />
        );
    }

    renderAssets() {
        if (this.props.assets) {
            return this.props.assets.map(this.renderAssetsHelper);
        }

        return null;
    }

    renderListHelper(li, key) {
        var ref = li.ref || li.props['data-ref'] || key;
        return (
            <li.type
                {...li.props}
                type="li"
                className={this.getClass(li, key)}
                data-ref={ref}
                ref={ref}
                key={key}
            />
        );
    }

    renderList() {
        var list = this.props.list;

        return list.map(this.renderListHelper);
    }

    componentWillReceiveProps(props) {
        super.componentWillReceiveProps(props);

        if (props.openReveal != null && props.openReveal !== this.props.openReveal) {
            this.open(props.openReveal);
        }

        if (props.closeReveal && props.closeReveal !== this.props.closeReveal) {
            if (props.closeReveal === true) {
                this.close();
            } else if (Number.isInteger(props.closeReveal)) {
                for (let i = 0; i < props.closeReveal; i++) {
                    this.close();
                }
            }
        }
    }

    getClass(li, key) {
        var classes = '';
        var currentlyOpen = this.state.currentlyOpen || [];

        if (li.props.className) classes = li.props.className;

        if (currentlyOpen.indexOf(key) !== -1 ||
            currentlyOpen.indexOf('' + key) !== -1 ||
            currentlyOpen.indexOf(li.props['data-ref']) !== -1 ||
            currentlyOpen.indexOf(li.ref) !== -1
        ) {
            classes = classNames(classes, 'OPEN');
        }

        return classes;
    }

    revealGetClassNamesHelper(a, ref) {
        if (!ref || !_.isString(ref)) return a;
        return a + ' open-' + ref;
    }

    getClassNames() {
        var classes;
        var open = 'open-none';

        if (this.state.open) {
            open = _.reduce(this.state.currentlyOpen, this.revealGetClassNamesHelper, '');
        }

        classes = classNames(
            'reveal',
            open,
            super.getClassNames()
        );

        return classes;
    }

    renderCloseButton() {
        if (this.props.hideCloseButton) return null;
        return this.props.renderCloseButton.call(this);
    }

    render() {
        return (
            <div className={this.getClassNames()}>
                {this.renderAssets()}
                <div>
                    <ul>
                        {this.renderList()}
                    </ul>
                    {this.renderCloseButton()}
                </div>
            </div>
        );
    }
}

Reveal.defaultProps = _.defaults({
    list: [
        <li></li>,
        <li></li>,
        <li></li>,
        <li></li>
    ],
    openMultiple: false,
    onOpen: _.noop,
    onClose: _.noop,
    closeButtonContent: null,
    renderCloseButton: function () {
        return (
            <button
                className={classNames(
                    'navigation',
                    'close-reveal',
                    this.props.closeButtonClassName,
                    this.props.prevButtonClassName,
                ) /* prevButtonClassName to be removed */ }
                onClick={this.close.bind(this)}
            >
                {this.props.closeButtonContent}
            </button>
        );
    },
}, Component.defaultProps);

export default Reveal;
