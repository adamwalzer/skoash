import classNames from 'classnames';

import Component from 'components/component';

const AREA = 'area';
const CONTENT = 'content';
const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';

class Slider extends Component {
    constructor(props) {
        super(props);

        this.state = _.defaults({
            firstSlide: 0,
        }, this.state);

        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
        this.getContentStyle = this.getContentStyle.bind(this);
    }

    prev() {
        this.changeSlide(-1 * this.props.increment);
    }

    next() {
        this.changeSlide(this.props.increment);
    }

    changeSlide(increment) {
        var firstSlide;

        if (this.props.loop) {
            firstSlide = (this.state.firstSlide + increment + this.props.children.length) %
                this.props.children.length;
        } else {
            firstSlide = Math.max(this.state.firstSlide + increment, 0);
        }

        this.setState({
            firstSlide
        });
    }

    getContentStyle() {
        if (this.props.orientation === HORIZONTAL) {
            return {
                marginLeft: this.state.firstSlide * -100 + '%'
            };
        } else {
            return {
                marginTop: this.state.firstSlide * -100 + '%'
            };
        }
    }

    getClassNames() {
        return classNames('slider', super.getClassNames());
    }

    renderContentList(listName = 'children') {
        var children = [].concat(this.props[listName]);
        return children.map((component, key) => {
            var ref;
            var opacity;
            if (!component) return;
            ref = component.ref || (component.props && component.props['data-ref']) || listName + '-' + key;
            opacity = (key >= this.state.firstSlide &&
                key < this.state.firstSlide + this.props.display) ? 1 : 0;
            return (
                <component.type
                    gameState={this.props.gameState}
                    {...component.props}
                    ref={ref}
                    key={key}
                    style={{
                        left: (key * 100) + '%',
                        opacity
                    }}
                />
            );
        });
    }

    render() {
        if (!this.props.shouldRender) return null;

        return (
            <this.props.type {...this.props} className={this.getClassNames()}>
                <button className="prev-slide" onClick={this.prev} />
                <div className={AREA}>
                    <div
                        className={CONTENT}
                        style={this.getContentStyle()}
                    >
                        {this.renderContentList()}
                    </div>
                </div>
                <button className="next-slide" onClick={this.next} />
            </this.props.type>
        );
    }
}

Slider.defaultProps = _.defaults({
    loop: true,
    display: 1,
    orientation: HORIZONTAL,
    increment: 1,
}, Component.defaultProps);

export default Slider;
