<?php

namespace StudentCouncilProtocols;

class Shortcode
{
    private $locations;

    public function __construct()
    {
        add_action('init', array($this, 'register_shortcodes'));
        add_action('wp_ajax_protocol_locations', array($this, 'getProtocolLocations'));
    }

    public function register_shortcodes()
    {
        add_shortcode('protocol-map', array($this, 'protocolMap'));
    }

    public function protocolMap()
    {
        if (!defined('G_GEOCODE_SERVER_KEY')) {
            error_log("Define constant 'G_GEOCODE_SERVER_KEY' to continue.");
            return;
        }

        $this->shortcodeScripts();
        echo '<div class="protocol-cluster"><div id="protocol-cluster-map"></div></div>';
    }

    public function getProtocolLocations()
    {
        if (!$locations = wp_cache_get('protocol_locations')) {
            ignore_user_abort();

            $locations = array();
            $args = array(
                'posts_per_page'   => -1,
                'post_type'        => 'protocol',
                'post_status'      => 'publish',
            );
            $protocols = get_posts($args);

            if (!empty($protocols)) {
                foreach ($protocols as $key => $protocol) {
                    // Pause one second to avoid 'OVER_QUERY_LIMIT' of 50 requests/sec
                    if (($key + 1) % 49 == 0) {
                        sleep(1);
                    }

                    $formData = get_post_meta($protocol->ID, 'form-data', true);
                    $senderAddress = $formData['adress'] ?? $formData['address'] ?? null;
                    if (is_array($senderAddress) && !empty($senderAddress)) {
                        $senderAddress = implode(',', $senderAddress);
                        $coordinates = $this->getCoordinates($senderAddress);
                        if (!empty($coordinates)) {
                            $locations[] = array(
                                'title'        => $protocol->post_title,
                                'address'      => $senderAddress,
                                'excerpt'      => wp_trim_words($protocol->post_content, 30),
                                'permalink'    => get_permalink($protocol->ID),
                                'coordinates'  => $coordinates
                            );
                        }
                    }
                }
            }

            // Save in cache for 2 weeks
            wp_cache_add('protocol_locations', $locations, '', 1209600);
        }

        wp_send_json($locations);
    }

    public function getCoordinates($address)
    {
        $url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($address) . '&key=' . G_GEOCODE_SERVER_KEY;
        $data = json_decode(file_get_contents($url));
        $coordinates = array();

        if (isset($data->status) && $data->status == 'OK') {
            $coordinates['lat'] = $data->results[0]->geometry->location->lat;
            $coordinates['lng'] = $data->results[0]->geometry->location->lng;
        }

        return $coordinates;
    }

    public function shortcodeScripts()
    {
        add_action('wp_enqueue_scripts', function () {
            wp_enqueue_script('marker-clusterer', STUDENTCOUNCILPROTOCOLS_URL  . '/source/js/vendor/MarkerClusterer.min.js', array(), '', true);
            wp_enqueue_script('marker-spiderfier', STUDENTCOUNCILPROTOCOLS_URL  . '/source/js/vendor/OverlappingMarkerSpiderfier.min.js', array(), '', true);

            wp_enqueue_script('student-council-protocols');
            wp_enqueue_script('google-maps-api');
            wp_enqueue_style('student-council-protocols');
            wp_localize_script('student-council-protocols', 'studentCouncilProtocols', array(
                'cluster' => array(
                    'iconPath' => STUDENTCOUNCILPROTOCOLS_URL . '/source/assets/images/'
                ),
                'readMore' => __('Read more', 'student-council-protocols')
            ));
        });
    }
}
