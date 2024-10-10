const chroma = require('chroma-js');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');
const flattenColorPalette =
    require('tailwindcss/lib/util/flattenColorPalette').default;
const generateContrasts = require(
    path.resolve(__dirname, '../utils/generate-contrasts')
);
const jsonToSassMap = require(
    path.resolve(__dirname, '../utils/json-to-sass-map')
);

const normalizeTheme = (theme) => {
    return _.fromPairs(
        _.map(
            _.omitBy(
                theme,
                (palette, paletteName) =>
                    paletteName.startsWith('on') || _.isEmpty(palette)
            ),
            (palette, paletteName) => [
                paletteName,
                {
                    ...palette,
                    DEFAULT: palette['DEFAULT'] || palette[500],
                },
            ]
        )
    );
};

const theming = plugin.withOptions(
    (options) =>
        ({ addComponents, e, theme }) => {

            const userThemes = _.fromPairs(
                _.map(options.themes, (theme, themeName) => [
                    themeName,
                    _.defaults({}, theme, options.themes['default']),
                ])
            );

            let themes = _.fromPairs(
                _.map(userThemes, (theme, themeName) => [
                    themeName,
                    normalizeTheme(theme),
                ])
            );

            themes = _.fromPairs(
                _.map(themes, (theme, themeName) => [
                    themeName,
                    _.pick(
                        _.fromPairs(
                            _.map(theme, (palette, paletteName) => [
                                paletteName,
                                {
                                    ...palette,
                                    contrast: _.fromPairs(
                                        _.map(
                                            generateContrasts(palette),
                                            (color, hue) => [
                                                hue,
                                                _.get(userThemes[themeName], [
                                                    `on-${paletteName}`,
                                                    hue,
                                                ]) || color,
                                            ]
                                        )
                                    ),
                                },
                            ])
                        ),
                        ['primary', 'accent', 'warn']
                    ),
                ])
            );

            themes = _.fromPairs(
                _.map(themes, (theme, themeName) => [
                    themeName,
                    {
                        selector: `".theme-${themeName}"`,
                        ...theme,
                    },
                ])
            );

            const sassMap = jsonToSassMap(
                JSON.stringify({ 'user-themes': themes })
            );

            const filename = path.resolve(
                __dirname,
                '../../styles/user-themes.scss'
            );

            let data;
            try {
                data = fs.readFileSync(filename, { encoding: 'utf8' });
            } catch (err) {
                console.error(err);
            }

            if (data !== sassMap) {
                try {
                    fs.writeFileSync(filename, sassMap, { encoding: 'utf8' });
                } catch (err) {
                    console.error(err);
                }
            }

            addComponents(
                _.fromPairs(
                    _.map(options.themes, (theme, themeName) => [
                        themeName === 'default'
                            ? 'body, .theme-default'
                            : `.theme-${e(themeName)}`,
                        _.fromPairs(
                            _.flatten(
                                _.map(
                                    flattenColorPalette(
                                        _.fromPairs(
                                            _.flatten(
                                                _.map(
                                                    normalizeTheme(theme),
                                                    (palette, paletteName) => [
                                                        [
                                                            e(paletteName),
                                                            palette,
                                                        ],
                                                        [
                                                            `on-${e(paletteName)}`,
                                                            _.fromPairs(
                                                                _.map(
                                                                    generateContrasts(
                                                                        palette
                                                                    ),
                                                                    (
                                                                        color,
                                                                        hue
                                                                    ) => [
                                                                        hue,
                                                                        _.get(
                                                                            theme,
                                                                            [
                                                                                `on-${paletteName}`,
                                                                                hue,
                                                                            ]
                                                                        ) ||
                                                                            color,
                                                                    ]
                                                                )
                                                            ),
                                                        ],
                                                    ]
                                                )
                                            )
                                        )
                                    ),
                                    (value, key) => [
                                        [`--angor-${e(key)}`, value],
                                        [
                                            `--angor-${e(key)}-rgb`,
                                            chroma(value).rgb().join(','),
                                        ],
                                    ]
                                )
                            )
                        ),
                    ])
                )
            );


            const schemeCustomProps = _.map(
                ['light', 'dark'],
                (colorScheme) => {
                    const isDark = colorScheme === 'dark';
                    const background = theme(
                        `angor.customProps.background.${colorScheme}`
                    );
                    const foreground = theme(
                        `angor.customProps.foreground.${colorScheme}`
                    );
                    const lightSchemeSelectors =
                        'body.light, .light, .dark .light';
                    const darkSchemeSelectors =
                        'body.dark, .dark, .light .dark';

                    return {
                        [isDark ? darkSchemeSelectors : lightSchemeSelectors]: {

                            ...(!isDark ? { '--is-dark': 'false' } : {}),

                            ..._.fromPairs(
                                _.flatten(
                                    _.map(background, (value, key) => [
                                        [`--angor-${e(key)}`, value],
                                        [
                                            `--angor-${e(key)}-rgb`,
                                            chroma(value).rgb().join(','),
                                        ],
                                    ])
                                )
                            ),
                            ..._.fromPairs(
                                _.flatten(
                                    _.map(foreground, (value, key) => [
                                        [`--angor-${e(key)}`, value],
                                        [
                                            `--angor-${e(key)}-rgb`,
                                            chroma(value).rgb().join(','),
                                        ],
                                    ])
                                )
                            ),
                        },
                    };
                }
            );

            const schemeUtilities = (() => {
                return {};
            })();

            addComponents(schemeCustomProps);
            addComponents(schemeUtilities);
        },
    (options) => {
        return {
            theme: {
                extend: {
                    colors: _.fromPairs(
                        _.flatten(
                            _.map(
                                _.keys(
                                    flattenColorPalette(
                                        normalizeTheme(options.themes.default)
                                    )
                                ),
                                (name) => [
                                    [
                                        name,
                                        `rgba(var(--angor-${name}-rgb), <alpha-value>)`,
                                    ],
                                    [
                                        `on-${name}`,
                                        `rgba(var(--angor-on-${name}-rgb), <alpha-value>)`,
                                    ],
                                ]
                            )
                        )
                    ),
                },
                angor: {
                    customProps: {
                        background: {
                            light: {
                                'bg-app-bar': '#FFFFFF',
                                'bg-card': '#FFFFFF',
                                'bg-default': '#cbdde1',
                                /* slate.100 */
                                'bg-dialog': '#FFFFFF',
                                'bg-hover': chroma('#3b7586')
                                    /* slate.400 */
                                    .alpha(0.12)
                                    .css(),
                                'bg-status-bar': '#6b98a4',
                                /* slate.300 */
                            },
                            dark: {
                                'bg-app-bar': '#022229',
                                /* slate.900 */
                                'bg-card': '#042f38',
                                /* slate.800 */
                                'bg-default': '#022229',
                                /* slate.900 */
                                'bg-dialog': '#032128',
                                /* slate.800 */
                                'bg-hover': 'rgba(255, 255, 255, 0.05)',
                                'bg-status-bar': '#022229',
                                /* slate.900 */
                            },
                        },
                        foreground: {
                            light: {
                                'text-default': '#032128',
                                /* slate.800 */
                                'text-secondary': '#155b6a',
                                /* slate.500 */
                                'text-hint': '#3b7586',
                                /* slate.400 */
                                'text-disabled': '#3b7586',
                                /* slate.400 */
                                border: '#9bbac3',
                                /* slate.200 */
                                divider: '#9bbac3',
                                /* slate.200 */
                                icon: '#083b46',
                                /* slate.500 */
                                'mat-icon': '#083b46',
                                /* slate.500 */
                            },
                            dark: {
                                'text-default': '#FFFFFF',
                                'text-secondary': '#3b7586',
                                /* slate.400 */
                                'text-hint': '#40899f',
                                /* slate.500 */
                                'text-disabled': '#07343e',
                                /* slate.600 */
                                border: chroma('#cbdde1')
                                    /* slate.100 */
                                    .alpha(0.12)
                                    .css(),
                                divider: chroma('#cbdde1')
                                    /* slate.100 */
                                    .alpha(0.12)
                                    .css(),
                                icon: '#3b7586',
                                /* slate.400 */
                                'mat-icon': '#3b7586',
                                /* slate.400 */
                            },
                        },
                    },
                },
            },
        };
    }
);

module.exports = theming;
