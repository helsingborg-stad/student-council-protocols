<?php

/**
 * Plugin Name:       Student Council Protocols
 * Plugin URI:        https://github.com/helsingborg-stad/student-council-protocols
 * Description:       Plugin to post and view protocols.
 * Version:           1.0.0
 * Author:            Max Frederiksen
 * Author URI:        https://github.com/helsingborg-stad
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       student-council-protocols
 * Domain Path:       /languages
 */

 // Protect agains direct file access
if (! defined('WPINC')) {
    die;
}

define('STUDENTCOUNCILPROTOCOLS_PATH', plugin_dir_path(__FILE__));
define('STUDENTCOUNCILPROTOCOLS_URL', plugins_url('', __FILE__));
define('STUDENTCOUNCILPROTOCOLS_VIEW_PATH', STUDENTCOUNCILPROTOCOLS_PATH . 'views/');
define('STUDENTCOUNCILPROTOCOLS_CACHE_DIR', trailingslashit(wp_upload_dir()['basedir']) . 'cache/blade-cache/');

// echo '<pre>';
// print_r(plugin_basename(dirname(__FILE__)) . '/languages');
// echo '</pre>';
// die();
load_plugin_textdomain('student-council-protocols', false, plugin_basename(dirname(__FILE__)) . '/languages');

require_once STUDENTCOUNCILPROTOCOLS_PATH . 'source/php/Vendor/Psr4ClassLoader.php';
require_once STUDENTCOUNCILPROTOCOLS_PATH . 'Public.php';
if (file_exists(STUDENTCOUNCILPROTOCOLS_PATH . 'vendor/autoload.php')) {
    require_once STUDENTCOUNCILPROTOCOLS_PATH . 'vendor/autoload.php';
}

// Acf auto import and export
add_action('plugins_loaded', function () {
    $acfExportManager = new \AcfExportManager\AcfExportManager();
    $acfExportManager->setTextdomain('student-council-protocols');
    $acfExportManager->setExportFolder(STUDENTCOUNCILPROTOCOLS_PATH . 'acf-fields/');
    $acfExportManager->autoExport(array(
        'protocol_status' => 'group_5a134a48de846',
		'administration_unit' => 'group_5a134bb83af1a',
        'tax_color' => 'group_5ab3a45759ba5'
    ));
    $acfExportManager->import();
});

// Instantiate and register the autoloader
$loader = new StudentCouncilProtocols\Vendor\Psr4ClassLoader();
$loader->addPrefix('StudentCouncilProtocols', STUDENTCOUNCILPROTOCOLS_PATH);
$loader->addPrefix('StudentCouncilProtocols', STUDENTCOUNCILPROTOCOLS_PATH . 'source/php/');
$loader->register();

// Start application
new StudentCouncilProtocols\App();
