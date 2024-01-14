<?php
/* @var $this NewsletterMainAdmin */
/* @var $controls NewsletterControls */

defined('ABSPATH') || exit;

if (!$controls->is_action()) {
    $controls->data = $this->get_options('info');
} else {

    if ($controls->is_action('save')) {
        $this->save_options($controls->data, 'info');
        $controls->add_message_saved();
    }
}
?>

<div class="wrap" id="tnp-wrap">
    <?php include NEWSLETTER_ADMIN_HEADER ?>

    <div id="tnp-heading">

        <h2><?php _e('Settings', 'newsletter') ?></h2>
        <?php include __DIR__ . '/nav.php'?>

    </div>
    <div id="tnp-body">

        <?php $controls->show() ?>

        <form method="post" action="">
            <?php $controls->init(); ?>

            <div id="tabs">

                <ul>
                    <li><a href="#tabs-general"><?php _e('General', 'newsletter') ?></a></li>
                    <li><a href="#tabs-social"><?php _e('Social', 'newsletter') ?></a></li>
                    <?php if (NEWSLETTER_DEBUG) { ?>
                        <li><a href="#tabs-debug">Debug</a></li>
                    <?php } ?>
                </ul>

                <div id="tabs-general">

                    <?php $this->language_notice(); ?>

                    <?php if ($is_all_languages) { ?>
                        <h3><?php _e('Header Settings', 'newsletter') ?></h3>

                        <table class="form-table">
                            <tr>
                                <th>
                                    <?php _e('Logo', 'newsletter') ?><br>
                                </th>
                                <td style="cursor: pointer">
                                    <?php $controls->media('header_logo', 'medium'); ?>
                                </td>
                            </tr>
                            <tr>
                                <th><?php _e('Title', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->text('header_title', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th><?php _e('Motto', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->text('header_sub', 40); ?>
                                </td>
                            </tr>
                        </table>

                        <h3><?php _e('Footer Settings', 'newsletter') ?></h3>

                        <table class="form-table">
                            <tr>
                                <th><?php _e('Company name', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->text('footer_title', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th><?php _e('Address', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->text('footer_contact', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th><?php _e('Copyright or legal text', 'newsletter') ?></th>
                                <td>
                                    <?php $controls->text('footer_legal', 40); ?>
                                </td>
                            </tr>
                        </table>
                    <?php } ?>
                </div>

                <div id="tabs-social">
                    <?php $this->language_notice(); ?>
                    <?php if ($is_all_languages) { ?>

                        <table class="form-table">
                            <tr>
                                <th>Facebook URL</th>
                                <td>
                                    <?php $controls->text('facebook_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Twitter URL</th>
                                <td>
                                    <?php $controls->text('twitter_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Instagram URL</th>
                                <td>
                                    <?php $controls->text('instagram_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Pinterest URL</th>
                                <td>
                                    <?php $controls->text('pinterest_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Linkedin URL</th>
                                <td>
                                    <?php $controls->text('linkedin_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Tumblr URL</th>
                                <td>
                                    <?php $controls->text('tumblr_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>YouTube URL</th>
                                <td>
                                    <?php $controls->text('youtube_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Vimeo URL</th>
                                <td>
                                    <?php $controls->text('vimeo_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Soundcloud URL</th>
                                <td>
                                    <?php $controls->text('soundcloud_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Telegram URL</th>
                                <td>
                                    <?php $controls->text('telegram_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>VK URL</th>
                                <td>
                                    <?php $controls->text('vk_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Twitch</th>
                                <td>
                                    <?php $controls->text('twitch_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Discord</th>
                                <td>
                                    <?php $controls->text('discord_url', 40); ?>
                                </td>
                            </tr>
                            <tr>
                                <th>TikTok</th>
                                <td>
                                    <?php $controls->text('tiktok_url', 40); ?>
                                </td>
                            </tr>
                        </table>
                    <?php } ?>
                </div>

                <?php if (NEWSLETTER_DEBUG) { ?>
                    <div id="tabs-debug">
                        <pre><?php echo esc_html(json_encode($this->get_db_options('info', $language), JSON_PRETTY_PRINT)) ?></pre>
                    </div>
                <?php } ?>
            </div>

            <div class="tnp-buttons">
                <?php $controls->button_save(); ?>
            </div>

        </form>
    </div>

    <?php include NEWSLETTER_DIR . '/tnp-footer.php'; ?>

</div>
