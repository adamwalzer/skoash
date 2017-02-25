export default function (props, opts = {}) {
    return (
        <$k.Component className="sprite-animation">
            <skoash.SpriteCSS
                {...opts.SpriteProps}
                spriteClass={opts.className}
                src={opts.src}
                dataTarget={opts.className}
            />
            <skoash.Animation
                {...opts.AnimationProps}
                className={opts.className}
                frames={_.get(props, `gameState.data.${opts.className}.frames.length`, 1)}
                duration={opts.duration}
                animate={opts.animate}
            />
        </$k.Component>
    );
}

