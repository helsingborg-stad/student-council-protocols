<?php

namespace StudentCouncilProtocols\Helper;

use Philo\Blade\Blade;

class RenderBlade
{
    /**
     * Return markup from a Blade template
     * @param  string $view     View name
     * @param  array  $data     View data
     * @param  string $viewPath Path to the blade views
     * @return string           The markup
     */
    public static function blade($view, $data = array(), $viewPath = STUDENTCOUNCILPROTOCOLS_VIEW_PATH)
    {
        if (!file_exists(STUDENTCOUNCILPROTOCOLS_CACHE_DIR)) {
            mkdir(STUDENTCOUNCILPROTOCOLS_CACHE_DIR, 0777, true);
        }

        $blade = new Blade($viewPath, STUDENTCOUNCILPROTOCOLS_CACHE_DIR);
        return $blade->view()->make($view, $data)->render();
    }
}
