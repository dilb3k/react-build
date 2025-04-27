const generateVueCode = (layout) => {
    const rows = layout.rows || [{ columns: layout.columns }];

    if (!Array.isArray(rows)) {
        console.warn("generateVueCode: rows is not an array", layout);
        return "<template></template>\n<script>\nexport default {};\n</script>\n<style scoped></style>";
    }

    let template = '<template>\n  <div class="container">\n';
    let script = '<script>\nexport default {\n  data() {\n    return {\n      // Component data here\n    }\n  },\n  methods: {\n    // Component methods here\n  }\n}\n</script>\n\n';
    let style = '<style scoped>\n.container {\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n';

    // Endi `rows.forEach` ishlaydi
    rows.forEach(row => {
        template += '    <div class="row">\n';
        row.columns.forEach(column => {
            const columnStyle = generateStyleString(column.style);
            template += `      <div class="column" style="${columnStyle}">\n`;

            column.components.forEach(component => {
                template += '        ' + generateVueComponent(component) + '\n';

                if (component.style) {
                    const selector = `.${component.type}-${component.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
                    style += `${selector} {\n`;
                    Object.entries(component.style).forEach(([key, value]) => {
                        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                        style += `  ${cssKey}: ${value};\n`;
                    });
                    style += '}\n\n';
                }
            });

            template += '      </div>\n';
        });

        template += '    </div>\n';
    });

    style += '.row {\n  display: flex;\n  flex-wrap: wrap;\n  margin-bottom: 20px;\n}\n\n';
    style += '.column {\n  flex: 1;\n  padding: 10px;\n}\n</style>';

    template += '  </div>\n</template>\n\n';

    return template + script + style;
};


const generateVueComponent = (component) => {
    const componentStyle = generateStyleString(component.style);
    const className = `${component.type}-${component.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

    switch (component.type) {
        case 'button':
            return `<button class="${className}" style="${componentStyle}">${component.props?.text || 'Button'}</button>`;

        case 'input':
            return `<input type="text" class="${className}" placeholder="${component.props?.placeholder || 'Input'}" style="${componentStyle}" />`;

        case 'div':
            return `<div class="${className}" style="${componentStyle}">${component.props?.text || 'Div Content'}</div>`;

        case 'heading':
            return `<h2 class="${className}" style="${componentStyle}">${component.props?.text || 'Heading'}</h2>`;

        case 'paragraph':
            return `<p class="${className}" style="${componentStyle}">${component.props?.text || 'Paragraph text'}</p>`;

        case 'image':
            return `<img class="${className}" src="${component.props?.src || '/placeholder.jpg'}" alt="${component.props?.alt || 'Image'}" style="${componentStyle}" />`;

        default:
            return `<div class="${className}" style="${componentStyle}">Unknown component</div>`;
    }
};

const generateStyleString = (style) => {
    if (!style) return '';

    return Object.entries(style)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
};

export default generateVueCode;
