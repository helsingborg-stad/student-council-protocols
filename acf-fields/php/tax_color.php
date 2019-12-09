<?php 


if (function_exists('acf_add_local_field_group')) {

    acf_add_local_field_group(array(
    'key' => 'group_5ab3a45759ba5',
    'title' => __('Taxonomy color', 'student-council-protocols'),
    'fields' => array(
        0 => array(
            'key' => 'field_5ab3a4798ad9a',
            'label' => __('Background color', 'student-council-protocols'),
            'name' => 'taxonomy_color',
            'type' => 'color_picker',
            'instructions' => __('Select a custom background color for the taxonomy.', 'student-council-protocols'),
            'required' => 0,
            'conditional_logic' => 0,
            'wrapper' => array(
                'width' => '',
                'class' => '',
                'id' => '',
            ),
            'default_value' => '',
        ),
    ),
    'location' => array(
        0 => array(
            0 => array(
                'param' => 'taxonomy',
                'operator' => '==',
                'value' => 'protocol_statuses',
            ),
        ),
    ),
    'menu_order' => 0,
    'position' => 'normal',
    'style' => 'default',
    'label_placement' => 'top',
    'instruction_placement' => 'label',
    'hide_on_screen' => '',
    'active' => 1,
    'description' => '',
));

}