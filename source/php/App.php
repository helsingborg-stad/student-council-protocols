<?php

namespace StudentCouncilProtocols;

use Philo\Blade\Blade as Blade;

class App
{
    public function __construct()
    {
        new PostTypes\Protocol();

        add_action('init', array($this, 'initialize'));
        add_action('wp_ajax_nopriv_userVisitAjax', array($this, 'userVisitAjax'));
        add_action('wp_ajax_userVisitAjax', array($this, 'userVisitAjax'));
        add_action('wp_enqueue_scripts', array($this, 'script'), 5);
        add_action('plugins_loaded', function () {
            if (class_exists('\\ModularityFormBuilder\\Entity\\PostType')) {
                new Shortcode();
            }
        });

        /* Register Modularity v2 modules */
        add_action('plugins_loaded', function () {
            if (function_exists('modularity_register_module')) {
                modularity_register_module(
                    STUDENTCOUNCILPROTOCOLS_PATH . 'source/php/Module/Event',
                    'Event'
                );

                modularity_register_module(
                    STUDENTCOUNCILPROTOCOLS_PATH . 'source/php/Module/Location',
                    'Location'
                );

                modularity_register_module(
                    STUDENTCOUNCILPROTOCOLS_PATH . 'source/php/Module/SubmitForm',
                    'SubmitForm'
                );
            }
        });

        add_filter('Municipio/blade/view_paths', array($this, 'viewPaths'), 10, 1);
        add_action('rest_api_init', array($this, 'registerRestApiMeta'));
    }

    public function registerRestApiMeta()
    {
        register_rest_field('protocol', 'metadata', array(
            'get_callback' => function ($data) {
                $auth = is_user_logged_in();
                $userId = get_current_user_id();
                $postMeta = get_post_meta($data['id']);
                $content = $data['content']['raw'];
                $title = $data['title']['raw'];
                $postFormData = unserialize($postMeta['form-data'][0]);
                $allSubjects = get_fields($postFormData['modularity-form-id'])['form_fields'][0]['values'];
                $subjects = $postFormData['valj-amnen-kategorier'];
                $postComments = get_comments(array('post_id' => $data['id']));
                $name = $postMeta['name_of_council_or_politician'];
                $targetGroup = $postMeta['target_group'];

                $response = array(
                    'authenticated' => $auth,
                    'currentUserId' => $userId,
                    'postMeta' => $postMeta,
                    'data' => $data,
                    'postFormData' => $postFormData,
                    'content' => $content,
                    'title' => $title,
                    'target_group' => $targetGroup,
                    'name_of_council_or_politician' => $name,
                    'subjects' => $subjects,
                    'allSubjects' => $allSubjects,
                    'commentsCount' => count($postComments)
                );
                return rest_ensure_response($response);
            }));

        register_rest_route(
            'wp/v2',
            '/protocols/users',
            array( 
                'methods' => \WP_REST_Server::READABLE,
                'callback' => array($this, 'getUsers'),
            )
        );
    }

    public function getSchoolsAndPoliticians($users)
    {
        $response = array(
            'politicians' => array(),
            'schools' => array()
        );
        foreach ($users as $user_ids) {
            $userMeta = get_user_meta($user_ids->ID);
            $targetGroup = $userMeta["target_group"][0];

            if ($targetGroup == "council") {
                array_push($response["schools"], $userMeta["name_of_council_or_politician"][0]);
            } elseif ($targetGroup == "politician") {
                array_push($response["politicians"], $userMeta["name_of_council_or_politician"][0]);
            }
        }

        return $response;
    }

    public function getUsers()
    {
        $users = get_users(array('fields' => array( 'ID' )));
        $schoolsAndPoliticians = $this->getSchoolsAndPoliticians($users);
        return rest_ensure_response($schoolsAndPoliticians);
    }

    public function initialize()
    {
        $userId = get_current_user_id();
        update_user_meta($userId, 'council_or_politician', 'council');
    }

    public function userVisitAjax() {

        $postId = $_POST['postId'];
        $increment = $_POST['increment'];
        $numberOfVisits = get_post_meta($postId, 'number_of_visits');

        if ($increment === 'true') {
            if (empty($numberOfVisits)) {
                update_post_meta($postId, 'number_of_visits', 1);
            } else {
                update_post_meta($postId, 'number_of_visits', ++$numberOfVisits[0]);
            }
        }

        return true;
      }

    public function viewPaths($paths)
    {
        $paths[] = STUDENTCOUNCILPROTOCOLS_PATH . 'views';
        return $paths;
    }

    /**
     * Enqueue scripts and styles for front ui
     * @return void
     */
    public function script()
    {
        global $post;

        wp_register_script(
            'student-council-protocols', 
            STUDENTCOUNCILPROTOCOLS_URL.'/dist/'.\StudentCouncilProtocols\Helper\CacheBust::name(
                'js/student-user-visit.js',
                false
            ), 
            array('jQuery'), 
            '', 
            true
        );

        if (defined('G_GEOCODE_KEY') && G_GEOCODE_KEY) {
            wp_register_script('google-maps-api', '//maps.googleapis.com/maps/api/js?key=' . G_GEOCODE_KEY . '', array(), '', true);
        }

        wp_register_style('student-council-protocols', STUDENTCOUNCILPROTOCOLS_URL.'/dist/'.\StudentCouncilProtocols\Helper\CacheBust::name(
            'css/student-styles.css',
            false
        ));

        if (is_object($post) && $post->post_type == 'protocol') {
            wp_enqueue_script('student-council-protocols');
            wp_enqueue_style('student-council-protocols');
            wp_enqueue_script('google-maps-api');
        }

        if (is_single()) {
            wp_localize_script('student-council-protocols', 'userVisitData', array('ajax_url' => admin_url('admin-ajax.php'),'nonce' => wp_create_nonce('userVisitNonce'),'post_id' => $post->ID));
        }

        \StudentCouncilProtocols\Helper\React::enqueue();

        wp_enqueue_script(
            'protocol-react-index',
            STUDENTCOUNCILPROTOCOLS_URL.'/dist/'.\StudentCouncilProtocols\Helper\CacheBust::name(
                'js/student-react.js',
                false
            ),
            array('jquery', 'react', 'react-dom'),
            false,
            true
        );

        $translations = array(
            'pageTitle' => __('All Protocols', 'student-council-protocols'),
            'searchPlaceholder' => __('Search all posts...', 'student-council-protocols'),
            'searchPlaceholderError' => __('You have to fill in this field.', 'student-council-protocols'),
            'searchAllPosts' => __('Search all posts', 'student-council-protocols'),
            'filterTitle' => __('Filter', 'student-council-protocols'),
            'council' => __('Council', 'student-council-protocols'),
            'politician' => __('Politician', 'student-council-protocols'),
            'all' => __('All', 'student-council-protocols'),
            'allCouncils' => __('All councils', 'student-council-protocols'),
            'allPoliticians' => __('All politicians', 'student-council-protocols'),
            'allSubjectsText' => __('All subjects', 'student-council-protocols'),
            'writtenBy' => __('Written By', 'student-council-protocols'),
            'subject' => __('Subject', 'student-council-protocols'),
            'found' => __('Found', 'student-council-protocols'),
            'protocols' => __('protocols', 'student-council-protocols'),
            'showAsList' => __('Show as list', 'student-council-protocols'),
            'showAsCards' => __('Show as cards', 'student-council-protocols'),
            'writeNewProtocol' => __('Write a new protocol', 'student-council-protocols'),
            'latest' => __('Latest', 'student-council-protocols'),
            'mostViewed' => __('Most viewed', 'student-council-protocols'),
            'comments' => __('Comments', 'student-council-protocols'),
            'previous' => __('Previous', 'student-council-protocols'),
            'next' => __('Next', 'student-council-protocols'),
            'noProtocolsFound' => __('No protocols found', 'student-council-protocols'),
        );

        wp_localize_script('protocol-react-index', 'reactData', array(
                'nonce' => wp_create_nonce('wp_rest'),
                'rest_url' => rest_url(),
                'translations' => $translations
            ));
    }

    /**
     * Return markup from a Blade template
     * @param  string $view View name
     * @param  array  $data View data
     * @return string       The markup
     */
    public static function blade($view, $data = array())
    {
        if (!file_exists(STUDENTCOUNCILPROTOCOLS_CACHE_DIR)) {
            mkdir(STUDENTCOUNCILPROTOCOLS_CACHE_DIR, 0777, true);
        }

        $paths = array(
            STUDENTCOUNCILPROTOCOLS_VIEW_PATH,
            get_template_directory() . '/views',
        );

        $blade = new Blade($paths, STUDENTCOUNCILPROTOCOLS_CACHE_DIR);
        return $blade->view()->make($view, $data)->render();
    }
}
