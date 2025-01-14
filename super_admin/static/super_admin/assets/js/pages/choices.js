const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({ addComponents, theme }) {
    addComponents({
        '.choices': {
            position: 'relative',
            overflow: 'hidden',
            marginBottom: theme('spacing.6'),
            fontSize: theme('fontSize.base'),

            '&:focus': {
                outline: 'none'
            },

            '&:last-child': {
                marginBottom: 0
            },

            '&.is-disabled': {
                '.choices__inner, .choices__input': {
                    backgroundColor: theme('colors.slate.100'),
                    cursor: 'not-allowed',
                },

                '.choices__item': {
                    cursor: 'not-allowed',
                }
            },

            '.choices__input': {
                marginBottom: 0,
                backgroundColor: theme('colors.white'),
            },

            '.choices__heading': {
                borderBottom: `1px solid ${theme('colors.slate.200')}`,
                color: theme('colors.slate.400'),
            },

            '[hidden]': {
                display: 'none',
            },

            '&[data-type*=select-one]': {
                cursor: 'pointer',

                '.choices__inner': {
                    paddingBottom: '4px',
                },

                '.choices__input': {
                    display: 'block',
                    width: '100%',
                    padding: '5px 15px',
                    borderBottom: `1px solid ${theme('colors.slate.200')}`,
                    backgroundColor: theme('colors.white'),
                    margin: 0,
                },

                '.choices__button': {
                    backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yLjU5Mi4wNDRsMTguMzY0IDE4LjM2NC0yLjU0OCAyLjU0OEwuMDQ0IDIuNTkyeiIvPjxwYXRoIGQ9Ik0wIDE4LjM2NEwxOC4zNjQgMGwyLjU0OCAyLjU0OEwyLjU0OCAyMC45MTJ6Ii8+PC9nPjwvc3ZnPg==")`,
                    padding: 0,
                    backgroundSize: '8px',
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    marginTop: '-10px',
                    marginRight: '25px',
                    height: '20px',
                    width: '20px',
                    borderRadius: '10em',
                    opacity: 0.25,

                    '&:hover, &:focus': {
                        opacity: theme('opacity.100'),
                    },

                    '&:focus': {
                        boxShadow: `0 0 0 2px ${theme('colors.custom.500')}`
                    }
                },

                '.choices__item': {
                    '&[data-value=""]': {
                        '.choices__button': {
                            display: 'none'
                        }
                    }
                },

                '&::after': {
                    content: `' '`,
                    height: 0,
                    width: 0,
                    borderStyle: 'solid',
                    borderColor: `${theme('colors.slate.200')} ${theme('colors.transparent')} ${theme('colors.transparent')} ${theme('colors.transparent')}`,
                    borderWidth: '5px',
                    position: 'absolute',
                    right: '11.5px',
                    top: '50%',
                    marginTop: '-2.5px',
                    pointerEvents: 'none'
                },

                '&.is-open': {
                    '&::after': {
                        borderColor: `${theme('colors.transparent')} ${theme('colors.transparent')} ${theme('colors.slate.200')} ${theme('colors.transparent')}`,
                    }
                }
            },

            '&[data-type*=select-multiple], &[data-type*=text]': {
                '.choices__inner': {
                    cursor: 'text',
                },

                '.choices__button': {
                    position: 'relative',
                    display: 'inline-block',
                    marginTop: 0,
                    marginRight: '-4px',
                    marginBottom: 0,
                    marginLeft: '8px',
                    paddingLeft: '16px',
                    borderLeft: `1px solid ${theme('colors.green.500')}`,
                    backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yLjU5Mi4wNDRsMTguMzY0IDE4LjM2NC0yLjU0OCAyLjU0OEwuMDQ0IDIuNTkyeiIvPjxwYXRoIGQ9Ik0wIDE4LjM2NEwxOC4zNjQgMGwyLjU0OCAyLjU0OEwyLjU0OCAyMC45MTJ6Ii8+PC9nPjwvc3ZnPg==")',
                    backgroundSize: '8px',
                    width: '8px',
                    lineHeight: 1,
                    opacity: 0.75,
                    borderRadius: 0,

                    '&::hover, &:focus': {
                        opacity: 1,
                    }
                }
            },

            '.choices__inner': {
                display: 'inline-block',
                verticalAlign: 'top',
                width: theme('width.full'),
                backgroundColor: theme('colors.white'),
                padding: '4px 6px 4px',
                border: `1px solid ${theme('colors.slate.200')}`,
                borderRadius: theme('borderRadius.md'),
                fontSize: theme('fontSize.sm'),
                minHeight: '39px',
                overflow: 'hidden',
            }
        },

        '.is-focused': {
            '.choices__inner': {
                borderColor: theme('colors.slate.200')
            }
        },

        '.choices__list': {
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
        },

        '.choices__list--single': {
            display: 'inline-block',
            padding: `${theme('spacing.1')} ${theme('spacing.4')} ${theme('spacing.1')} ${theme('spacing.1')}`,
            width: '100%',
        },

        '.choices__list--multiple': {
            display: 'inline',

            '.choices__item': {
                display: 'inline-block',
                verticalAlign: 'middle',
                borderRadius: theme('borderRadius.md'),
                padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
                fontSize: '11px',
                fontWeight: theme('fontWeight.medium'),
                marginRight: '3.75px',
                marginBottom: 0,
                backgroundColor: theme('colors.custom.500'),
                border: `1px solid ${theme('colors.custom.500')}`,
                color: theme('colors.white'),
                wordBreak: 'break-all',
                boxSizing: 'border-box',

                '&[data-deletable]': {
                    paddingRight: '5px',
                },

                '&.is-highlighted': {
                    backgroundColor: theme('colors.custom.500'),
                    border: `1px solid ${theme('colors.custom.500')}`,
                }
            }
        },

        '.is-disabled': {
            '.choices__list--multiple': {
                '.choices__item': {
                    backgroundColor: theme('colors.slate.300'),
                    border: `1px solid ${theme('colors.slate.200')}`,
                }
            }
        },

        '.choices__list--dropdown': {
            '.choices__list': {
                '&[aria-expanded]': {
                    visibility: 'hidden',
                    zIndex: 1,
                    position: 'absolute',
                    width: '100%',
                    backgroundColor: theme('colors.white'),
                    border: `1px solid ${theme('colors.slate.200')}`,
                    top: '100%',
                    marginTop: '-1px',
                    borderBottomLeftRadius: theme('borderRadius.md'),
                    borderBottomRightRadius: theme('borderRadius.md'),
                    overflow: 'hidden',
                    wordBreak: 'break-all',
                    willChange: 'visibility',
                }
            },
            '.choices__list, .choices__list[aria-expanded] .choices__list': {
                position: 'relative',
                maxHeight: '300px',
                overflow: 'auto',
                willChange: 'scroll-position',
            },

            '.choices__item, .choices__list[aria-expanded] .choices__item': {
                position: 'relative',
                padding: `${theme('spacing.2')} !important`,
                fontSize: `${theme('fontSize.sm')} !important`,
            },
            
        },
        
        '.choices__list--dropdown, .choices__list[aria-expanded]': {
            '.choices__item--selectable': {
                '&.is-highlighted': {
                    backgroundColor: theme('colors.slate.100'),
                }
            }
        },

        '.is-active': {
            '&.choices__list--dropdown': {
                visibility: 'visible'
            },

            '&.choices__list': {
                '&[aria-expanded]': {
                    visibility: 'visible'
                }
            }
        },

        '.is-open': {
            overflow: 'visible',

            '.choices__inner': {
                borderRadius: `${theme('borderRadius.md')} ${theme('borderRadius.md')} 0 0`,
                borderColor: theme('colors.slate.200')
            },

            '&.is-flipped': {
                borderRadius: `0 0 ${theme('borderRadius.md')} ${theme('borderRadius.md')}`,
            },

            '.choices__list--dropdown, .choices__list[aria-expanded]': {
                borderColor: theme('colors.slate.200')
            },
        },

        '.is-flipped': {
            '.choices__list--dropdown, .choices__list[aria-expanded]': {
                top: 'auto',
                bottom: '100%',
                marginTop: '0',
                marginBottom: '-1px',
                borderRadius: `${theme('borderRadius.md')} ${theme('borderRadius.md')} 0 0`,
            }
        },

        '@media (min-width: 640px)': {
            '.choices__list--dropdown': {
                '.choices__item--selectable': {
                    paddingRight: '100px',

                    '&::after': {
                        content: 'attr(data-select-text)',
                        fontSize: theme('fontSize.xs'),
                        opacity: theme('opacity.0'),
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }
                }
            },

            '.choices__list[aria-expanded]': {
                '.choices__item--selectable': {
                    paddingRight: '100px',

                    '&::after': {
                        content: 'attr(data-select-text)',
                        fontSize: theme('fontSize.xs'),
                        opacity: theme('opacity.0'),
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }
                }
            }
        }
    })
})