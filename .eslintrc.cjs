module.exports = {
    'env': {
      'browser': true,
      'es2021': true,
      'node': true
    },
    'extends': 'eslint:recommended',
    'parser': "@babel/eslint-parser",
    'parserOptions': {
        'requireConfigFile': false,
        'ecmaVersion': 12,
        'sourceType': 'module',
        'plugins': [
            '@babel/plugin-syntax-import-assertions'
        ]
    },
    'rules': {
    }
};