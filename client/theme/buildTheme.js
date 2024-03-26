const { join }= require('path');
const { buildThemedComponents }= require('@cloudscape-design/components-themeable/theming');

const theme= {
    tokens: {
    }
};

buildThemedComponents({
    theme,
    outputDir: join(__dirname, './build'),
});