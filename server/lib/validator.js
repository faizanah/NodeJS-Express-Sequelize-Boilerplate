var expressValidator = require('express-validator');
const yamlLint = require('yaml-lint');

function addCustomValidations() {
    expressValidator({
        customValidators: {
            isValidDate: function isValidDate(value) {
                if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
                const date = new Date(value);
                if (!date.getTime()) return false;
                return date.toISOString().slice(0, 10) === value;
            },
            isYaml: function isYaml(value){
                yamlLint.lint(value).then(function () {
                    return true;
                }).catch(function (error) {
                    return false;
                });

            }
        }
    })
}

module.exports = {
    addCustomValidations: addCustomValidations
};