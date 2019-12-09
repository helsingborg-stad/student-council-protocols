<?php

namespace StudentCouncilProtocols\Helper;

class File
{
	/**
	 * Return readable filenames
	 * @param  string $string Filename string
	 * @return string         Cleaned filename
	 */
	public static function cleanFileName($string)
	{
		$pathParts = pathinfo($string);

		$name = preg_replace('/([A-Za-z0-9]+-)/i', '', $pathParts['filename'], 1);
		$name = str_replace('_', ' ', $name);
		$name = str_replace('-', ' ', $name);

		return $name;
	}
}
