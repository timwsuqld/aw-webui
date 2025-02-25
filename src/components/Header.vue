<template lang="pug">
div.aw-navbar
  b-navbar(toggleable="lg")
    // Brand on mobile
    b-navbar-nav.d-block.d-lg-none
      b-navbar-brand(to="/" style="background-color: transparent;")
        img.aligh-middle(src="/static/logo.png" style="height: 1.5em;")
        span.ml-2.align-middle(style="font-size: 1em; color: #000;") ActivityWatch

    b-navbar-toggle(target="nav-collapse")

    b-collapse#nav-collapse(is-nav)
      b-navbar-nav
        // If only a single view (the default) is available
        b-nav-item(v-if="activityViewsDaily.length === 1", v-for="view in activityViewsDaily", :key="view.name", :to="view.pathUrl")
          div.px-2.px-lg-1
            icon(name="calendar-day")
            | Today

        // If multiple (or no) activity views are available
        b-nav-item-dropdown(v-if="activityViewsDaily.length !== 1")
          template(slot="button-content")
            div.d-inline.px-2.px-lg-1
              icon(name="calendar-day")
              | Today
          b-dropdown-item(v-if="activityViewsDaily.length <= 0", disabled)
            | No activity reports available
            br
            small Make sure you have both an AFK and window watcher running
          b-dropdown-item(v-for="view in activityViewsDaily", :key="view.name", :to="view.pathUrl")
            icon(:name="view.icon")
            | {{ view.name }}

        // If only a single view (the default) is available
        b-nav-item(v-if="activityViewsSummary.length === 1", v-for="view in activityViewsSummary", :key="view.name + '_summary'", :to="view.pathUrl")
          div.px-2.px-lg-1
            icon(name="calendar-week")
            | Summary

        // If multiple (or no) activity views are available
        b-nav-item-dropdown(v-if="activityViewsSummary.length !== 1")
          template(slot="button-content")
            div.d-inline.px-2.px-lg-1
              icon(name="calendar-week")
              | Summary
          b-dropdown-item(v-if="activityViewsSummary.length <= 0", disabled)
            | No activity reports available
            br
            small Make sure you have both an AFK and window watcher running
          b-dropdown-item(v-for="view in activityViewsSummary", :key="view.name + '_summary'", :to="view.pathUrl")
            icon(:name="view.icon")
            | {{ view.name }}


        b-nav-item(to="/timeline" style="font-color: #000;")
          div.px-2.px-lg-1
            icon(name="stream")
            | Timeline

        b-nav-item(to="/stopwatch")
          div.px-2.px-lg-1
            icon(name="stopwatch")
            | Stopwatch

      // Brand on large screens (centered)
      b-navbar-nav.abs-center.d-none.d-lg-block
        b-navbar-brand(to="/" style="background-color: transparent;")
          img.ml-0.aligh-middle(src="/static/logo.png" style="height: 1.5em;")
          span.ml-2.align-middle(style="font-size: 1.0em; color: #000;") ActivityWatch

      b-navbar-nav.ml-auto
        b-nav-item(to="/query", active-class="aw-active")
          div.px-2.px-lg-1
            icon(name="search")
            | Query
        b-nav-item(to="/buckets")
          div.px-2.px-lg-1
            icon(name="database")
            | Raw Data
        b-nav-item(to="/settings")
          div.px-2.px-lg-1
            icon(name="cog")
            | Settings
</template>

<script>

// only import the icons you use to reduce bundle size
import 'vue-awesome/icons/calendar-day';
import 'vue-awesome/icons/calendar-week';
import 'vue-awesome/icons/stream';
import 'vue-awesome/icons/database';
import 'vue-awesome/icons/search';
import 'vue-awesome/icons/stopwatch';
import 'vue-awesome/icons/cog';

import 'vue-awesome/icons/mobile';
import 'vue-awesome/icons/desktop';

import _ from 'lodash';

// Set this to true to test Android behavior when on a desktop
const testingAndroid = false;

export default {
  name: 'Header',
  data() {
    return {
      activityViewsDaily: [],
      activityViewsSummary: [],
      isAndroidApp: testingAndroid || navigator.userAgent.includes("Android") && navigator.userAgent.includes("wv"), // Checks for Android and WebView
    };
  },
  mounted: async function() {
    const buckets = await this.$aw.getBuckets();
    const types_by_host = {};
    _.each(buckets, (v) => {
        types_by_host[v.hostname] = types_by_host[v.hostname] || {};
        // The '&& true;' is just to typecoerce into booleans
        types_by_host[v.hostname].afk |= v.type == "afkstatus";
        types_by_host[v.hostname].window |= v.type == "currentwindow";
        types_by_host[v.hostname].android |= v.type == "currentwindow" && this.isAndroidApp;  // Use other bucket type ID in the future
    })
    //console.log(types_by_host);

    _.each(types_by_host, (types, hostname) => {
        if(types.afk && types.window) {
          this.activityViewsDaily.push({
            name: hostname,
            hostname: hostname,
            type: "default",
            pathUrl: `/activity/daily/${hostname}`,
            icon: 'desktop'
          });
          this.activityViewsSummary.push({
            name: hostname,
            hostname: hostname,
            type: "default",
            pathUrl: `/activity/summary/${hostname}`,
            icon: 'desktop'
          });
        }
        if(testingAndroid || types.android) {
          this.activityViewsDaily.push({
            name: `${hostname} (Android)`,
            hostname: hostname,
            type: "android",
            pathUrl: '/activity/android',
            icon: 'mobile'
          });
        }
    })
  }
}
</script>

<style lang="scss" scoped>
.aw-navbar {
  background-color: #FFF;
  border: solid #CCC;
  border-width: 0 0 1px 0;
}

.active {
  background-color: #DDD;
  border-radius: 0.5em;
}

.nav-item {
  align-items: center;

  margin-left: 0.2em;
  margin-right: 0.2em;
  border-radius: 0.5em;

  &:hover {
    background-color: #DDD;
  }
}

.abs-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}
</style>

<style lang="scss">
// Needed because dropdown somehow doesn't properly work with scoping
.nav-item {
  .nav-link {
    color: #555 !important;
  }
}
</style>
