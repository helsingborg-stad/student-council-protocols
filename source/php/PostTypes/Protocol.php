<?php

namespace StudentCouncilProtocols\PostTypes;

class Protocol
{
    public $postTypeSlug;

    public function __construct()
    {
        $this->postTypeSlug = 'protocol';
        $this->slug = 'protocol_subjects';
        $this->namePlural = 'Subjects';
        $this->nameSingular = 'Subject';
        $this->args = array(
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_nav_menus' => true,
            '_builtin'          => false,
        );
        $this->taxonomyStatus();
        $this->taxonomyTargetGroup();
        // $this->taxonomyCategory();
        
        add_action('init', array($this, 'register'), 9);
        add_action('save_post_' . $this->postTypeSlug, array($this, 'setDefaultData'), 10, 3);
        add_action('Municipio/blog/post_info', array($this, 'addProtocolStatusPost'), 9, 1);
        add_filter('wp_insert_post_data', array($this, 'allowComments'), 99, 2);
        // add_filter('dynamic_sidebar_before', array($this, 'contentBeforeSidebar'));
        add_filter('is_active_sidebar', array($this, 'isActiveSidebar'), 11, 2);
        add_filter('ModularityFormBuilder/excluded_fields/front', array($this, 'excludedFields'), 10, 3);
        add_filter('Municipio/taxonomy/tag_style', array($this, 'setStatusColor'), 10, 3);
        add_filter('manage_edit-' . $this->postTypeSlug . '_columns', array($this, 'tableColumns'), 11);
        add_filter('ModularityFormBuilder/options/post_types', array($this, 'addSelectablePostType'));
    }

    public function addProtocolStatusPost($post)
    {
        if (is_object($post) && is_singular() && $post->post_type == $this->postTypeSlug) {
            $statuses = !is_wp_error(wp_get_post_terms($post->ID, 'protocol_statuses')) ? wp_get_post_terms($post->ID, 'protocol_statuses') : null;
            if (!empty($statuses[0])) {
                echo '<li><i class="pricon pricon-info-o"></i> ' . $statuses[0]->name . '</li>';
            }
        }
    }

    public function isProtocolPage()
    {
        global $post;

        if (is_object($post) && $post->post_type == $this->postTypeSlug && !is_archive() && !is_admin()) {
            return true;
        }

        return false;
    }

    /**
     * Manually activate right and bottom sidebar to add custom content
     * @param  boolean  $isActiveSidebar Original response
     * @param  string   $sidebar         Sidebar id
     * @return boolean
     */
    public function isActiveSidebar($isActiveSidebar, $sidebar)
    {
        if (($sidebar === 'right-sidebar' || $sidebar === 'bottom-sidebar') && $this->isprotocolPage()) {
            return true;
        }

        return $isActiveSidebar;
    }

    /**
     * Render custom content in sidebar
     * @param string $sidebar
     */
    // public function contentBeforeSidebar($sidebar)
    // {
    //     global $post;

    //     if ($sidebar === 'right-sidebar' && $this->isProtocolPage()) {
    //         $data = \ModularityFormBuilder\Entity\PostType::gatherFormData($post);
    //         $data['showSocial'] = get_field('post_show_share', $post->ID);
    //         $data['showAuthor'] = is_user_logged_in() && get_field('post_show_author', $post->ID) && $post->post_author > 0;
    //         $data['authorUrl'] = function_exists('municipio_intranet_get_user_profile_url') ? municipio_intranet_get_user_profile_url($post->post_author) : null;
    //         $data['unit'] = class_exists('\Intranet\User\AdministrationUnits') ? \Intranet\User\AdministrationUnits::getUsersAdministrationUnitIntranet($post->post_author) : null;
    //         $uploadFolder = wp_upload_dir();
    //         $data['uploadFolder'] = $uploadFolder['baseurl'] . '/modularity-form-builder/';
    //         $data['profileImage'] = !empty($post->post_author) && get_the_author_meta('user_profile_picture', $post->post_author) ? \Municipio\Helper\Image::resize(get_the_author_meta('user_profile_picture', $post->post_author), 200, 200) : null;

    //         $tags = wp_get_post_terms($post->ID, 'hashtag');
    //         $tagIds = array();
    //         if (!is_wp_error($tags) && !empty($tags)) {
    //             foreach($tags as $tag) {
    //                 $tagIds[] = $tag->term_id;
    //             }
    //         }

    //         $data['relatedProtocols'] = get_posts(array(
    //             'numberposts' => 3,
    //             'post__not_in' => array($post->ID),
    //             'post_type' => $this->postTypeSlug,
    //             'tax_query' => array(
    //                 array(
    //                     'taxonomy' => 'protocol_tags',
    //                     'field' => 'hashtag',
    //                     'terms' => $tagIds,
    //                 )
    //             )
    //         ));

    //         echo \StudentCouncilProtocols\App::blade('protocol-widgets', $data);
    //     } elseif ($sidebar === 'bottom-sidebar' && $this->isprotocolPage()) {
    //         echo \StudentCouncilProtocols\App::blade('protocol-mail-modal');
    //     }
    // }

    /**
     * Registers protocol post type
     * @return void
     */
    public function register()
    {
        $args = array(
            'hierarchical'          => false,
            'description'           => 'Post type for managing protocols',
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_admin_bar'     => true,
            'menu_position'         => 50,
            'menu_icon'             => 'dashicons-lightbulb',
            'show_in_nav_menus'     => true,
            'publicly_queryable'    => true,
            'exclude_from_search'   => false,
            'has_archive'           => true,
            'query_var'             => true,
            'can_export'            => true,
            'rewrite'               => array(
                'with_front' => false,
                'slug' => $this->postTypeSlug
            ),
            'supports'              => array('title', 'author', 'editor', 'comments', 'thumbnail'),
            'show_in_rest'          => true,
            'rest_base'             => $this->postTypeSlug,
            'capabilities' => array(
                'create_posts' => 'edit_posts',
            ),
        );

        new \ModularityFormBuilder\Entity\PostType(
            $this->postTypeSlug,
            __('protocol', 'student-council-protocols'),
            __('Protocols', 'student-council-protocols'),
            $args
        );

        $this->registerTaxonomyCategory();
    }

    /**
     * Create status taxonomy
     * @return string
     */
    public function taxonomyStatus()
    {
        // Register new taxonomy
        $taxonomyStatus = new \ModularityFormBuilder\Entity\Taxonomy(
            __('Status', 'student-council-protocols'),
            __('Statuses', 'student-council-protocols'),
            'protocol_statuses',
            array($this->postTypeSlug),
            array(
                'hierarchical'      => false,
                'public'            => true,
                'show_ui'           => true,
                'show_in_nav_menus' => true,
                '_builtin'          => false,
            )
        );

        // Remove default UI
        add_action('admin_menu', function () {
            remove_meta_box('tagsdiv-protocol_statuses', $this->postTypeSlug, 'side');
        });

        //Add filter
        new \ModularityFormBuilder\Entity\Filter(
            $taxonomyStatus->slug,
            $this->postTypeSlug
        );
    }

    /**
     * Create administration unit taxonomy
     * @return string
     */
    public function taxonomyTargetGroup()
    {
        // Register new taxonomy
        $taxonomyTargetGroup = new \ModularityFormBuilder\Entity\Taxonomy(
            __('Target group', 'student-council-protocols'),
            __('Target groups', 'student-council-protocols'),
            'protocol_target_groups',
            array($this->postTypeSlug),
            array(
                'hierarchical'      => false,
                'public'            => true,
                'show_ui'           => false,
                'show_in_nav_menus' => false,
                '_builtin'          => false,
                'show_in_rest'      => true
            )
        );

        // Remove default UI
        add_action('admin_menu', function () {
            remove_meta_box('tagsdiv-protocol_administration_units', $this->postTypeSlug, 'side');
        });

        // echo '<pre>';
        // print_r('asdasdsa');
        // print_r(taxonomy_exists('protocol_target_group'));
        // echo '</pre>';
        // die();

        //Add filter
        new \ModularityFormBuilder\Entity\Filter(
            $taxonomyTargetGroup->slug,
            $this->postTypeSlug
        );
    }

    /**
     * Create status taxonomy
     * @return string
     */
    public function registerTaxonomyCategory()
    {
        $labels = array(
            'name'              => $this->namePlural,
            'singular_name'     => $this->nameSingular,
            'search_items'      => sprintf(__('Search %s', 'modularity-form-builder'), $this->namePlural),
            'all_items'         => sprintf(__('All %s', 'modularity-form-builder'), $this->namePlural),
            'parent_item'       => sprintf(__('Parent %s:', 'modularity-form-builder'), $this->nameSingular),
            'parent_item_colon' => sprintf(__('Parent %s:', 'modularity-form-builder'), $this->nameSingular) . ':',
            'edit_item'         => sprintf(__('Edit %s', 'modularity-form-builder'), $this->nameSingular),
            'update_item'       => sprintf(__('Update %s', 'modularity-form-builder'), $this->nameSingular),
            'add_new_item'      => sprintf(__('Add New %s', 'modularity-form-builder'), $this->nameSingular),
            'new_item_name'     => sprintf(__('New %s Name', 'modularity-form-builder'), $this->nameSingular),
            'menu_name'         => $this->namePlural,
        );

        $this->args['labels'] = $labels;

        register_taxonomy($this->slug, $this->postTypeSlug, $this->args);

        // Register new taxonomy
        // $taxonomyStatus = new \ModularityFormBuilder\Entity\Taxonomy(
        //     __('Subjext', 'student-council-protocols'),
        //     __('Subjexts', 'student-council-protocols'),
        //     'protocol_subjects',
        //     array($this->postTypeSlug),
        //     array(
        //         'hierarchical'      => true,
        //         'public'            => true,
        //         'show_ui'           => true,
        //         'show_in_nav_menus' => true,
        //         '_builtin'          => false,
        //     )
        // );
    }

    public function setDefaultData($postId, $post, $update)
    {
        if (!$update) {
            // Set default status
            wp_set_object_terms($postId, __('Incoming', 'student-council-protocols'), 'protocol_statuses');
            // Hide Share icons
            update_field('field_56c33d008efe3', false, $postId);
            // Hide Author
            update_field('field_56cadc4e0480b', false, $postId);
            // Hide Author image
            update_field('field_56cadc7b0480c', false, $postId);

            // Save administration unit
            if (class_exists('\\Intranet\\User\\AdministrationUnits')) {
                $unit = \Intranet\User\AdministrationUnits::getUsersAdministrationUnitIntranet();
                if ($unit) {
                    $term = term_exists($unit->name, 'protocol_administration_units');
                    if ($term !== 0 && $term !== null) {
                        wp_set_object_terms($postId, (int)$term['term_id'], 'protocol_administration_units');
                    } else {
                        $newTerm = wp_insert_term($unit->name, 'protocol_administration_units');
                        if (!is_wp_error($newTerm)) {
                            wp_set_object_terms($postId, (int)$newTerm['term_id'], 'protocol_administration_units');
                        }
                    }
                }
            }
        }
    }

    /**
     * Allow comments by default for this post type
     * @param  array $data    [description]
     * @param  array $postarr [description]
     * @return array          Modified data list
     */
    public function allowComments($data, $postarr) {
        if ($data['post_type'] == $this->postTypeSlug) {
            $data['comment_status'] = 'open';
        }

        return $data;
    }

    /**
     * Table columns
     * @param  array $columns
     * @return array
     */
    public function tableColumns($columns)
    {
        return array(
            'cb' => '',
            'title' => __('Title'),
            'date' => __('Date')
        );
    }

    public function excludedFields($exclude, $postType, $postId)
    {
        if ($postType === $this->postTypeSlug) {
            $exclude[] = 'sender-firstname';
            $exclude[] = 'sender-lastname';
            $exclude[] = 'sender-email';
            $exclude[] = 'sender-phone';
            $exclude[] = 'sender-address';
            $exclude[] = 'file_upload';
            $exclude[] = 'input';
            $exclude[] = 'checkbox';
        }

        return $exclude;
    }

    /**
     * Adds custom style to taxonomy tags
     * @param string  $attr      Default style string
     * @param string  $term      The term
     * @param string  $taxonomy  Taxnomy name
     * @param obj     $post      Post object
     * @return string            Modified style string
     */
    public function setStatusColor($style, $term, $taxonomy)
    {
        if ($taxonomy == 'protocol_statuses') {
            $color = get_field('taxonomy_color', $term);
            if (!empty($color)) {
                $style .= sprintf('background:%s;color:#fff;', $color);
            }
        }

        return $style;
    }

    /**
     * Add protocol post type to selectable post types option
     * @param $postTypes
     * @return array
     */
    public function addSelectablePostType($postTypes)
    {
        $postTypes[$this->postTypeSlug] = __('protocols', 'student-council-protocols');
        return $postTypes;
    }
}
