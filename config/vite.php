<?php

use craft\helpers\App;

return [
    'checkDevServer' => true,
    'useDevServer' => App::env('CRAFT_DEV_MODE'),
    'manifestPath' => Craft::getAlias('@webroot') . '/dist/manifest.json',
    'devServerPublic' => App::env('PRIMARY_SITE_URL') . ':3000',
    'devServerInternal' => 'http://localhost:3000',
    'serverPublic' => App::env('PRIMARY_SITE_URL') . '/dist/',
    'errorEntry' => '/src/scripts/main.js',
    'cacheKeySuffix' => '',
];
