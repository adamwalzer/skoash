import classNames from 'classnames';

import Component from 'components/component';

const AREA = 'area';
const CONTENT = 'content';
const HORIZONTAL = 'horizontal';

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

    componentDidUpdate() {
        if (this.props.orientation === HORIZONTAL) {
            this.adjust = document.getElementsByClassName('slider')[0]
                .getElementsByClassName(CONTENT)[0].clientWidth / this.props.children.length;
        } else {
            this.adjust = document.getElementsByClassName('slider')[0]
                .getElementsByClassName(CONTENT)[0].clientHeight / this.props.children.length;
        }
    }

    changeSlide(increment) {
        var firstSlide;

        if (this.props.loop && this.props.display === 1) {
            firstSlide = (this.state.firstSlide + increment + this.props.children.length) %
                this.props.children.length;
        } else {
            firstSlide = Math.min(Math.max(this.state.firstSlide + increment, 0),
                this.props.children.length - this.props.display);
        }

        this.setState({
            firstSlide
        });
    }

    getContentStyle() {
        if (this.props.orientation === HORIZONTAL) {
            return {
                marginLeft: this.state.firstSlide * this.adjust * -1 + 'px'
            };
        } else {
            return {
                marginTop: this.state.firstSlide * this.adjust * -1 + 'px'
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
            var position;
            if (!component) return;
            ref = component.ref || (component.props && component.props['data-ref']) || listName + '-' + key;
            opacity = (key >= this.state.firstSlide &&
                key < this.state.firstSlide + this.props.display) ? 1 : 0;
            position = this.props.orientation === HORIZONTAL ? 'left' : 'top';
            return (
                <component.type
                    gameState={this.props.gameState}
                    {...component.props}
                    ref={ref}
                    key={key}
                    style={{
                        [position]: (key * 100) + '%',
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
