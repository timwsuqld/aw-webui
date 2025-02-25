<template lang="pug">
div
  div.row.py-2.cls
    div.col-8.col-md-4
      span(:style="{ marginLeft: (2 * depth) + 'em'}")
        //| {{ cls.name.join(" ➤ ")}}
      | #[span(v-if="depth > 0") ⮡] {{ cls.name.slice(depth).join(" ➤ ")}}
    div.col-4.col-md-8
      //span.d-none.d-sm-inline.d-md-none(:style="{ marginLeft: (2 * depth) + 'em'}")
      span.d-none.d-md-inline
        span(v-if="cls.rule.type === null", style="color: #888") No rule
        span(v-else, style="") Rule ({{cls.rule.type}}): #[code {{cls.rule.pattern}}]
      span.float-right
        b-btn.ml-1(size="sm", variant="outline-secondary", @click="showEditModal($event)" style="border: 0;" pill)
          icon(name="edit")
        b-btn.ml-1(size="sm", variant="outline-success", @click="addSubclass(cls)" style="border: 0;" pill)
          icon(name="plus")
  div
    div.pa-2(v-for="child in cls.children", style="background: rgba(0, 0, 0, 0);", v-show="expanded")
      CategoryEditTree(:cls="child", :depth="depth+1")

  b-modal(id="edit" ref="edit" title="Edit category" @show="resetModal" @hidden="resetModal" @ok="handleOk")
    div.my-1
      b-input-group.my-1(prepend="Name")
        b-form-input(v-model="editing.name")
      b-input-group(prepend="Parent")
        b-select(v-model="editing.parent", :options="allCategories")

    hr

    div.my-1
      b Rule
      b-input-group.my-1(prepend="Type")
        b-select(v-model="editing.rule.type", :options="allRuleTypes")
      b-input-group.my-1(prepend="Pattern", v-if="editing.rule.type !== null")
        b-form-input(v-model="editing.rule.pattern")

    hr

    div.my-1
      b-btn(variant="danger", @click="removeClass(cls); $refs.edit.hide()")
        icon(name="trash")
        | Remove category
</template>

<script>
import 'vue-awesome/icons/plus-square';
import 'vue-awesome/icons/minus-square';
import 'vue-awesome/icons/caret-right';
import 'vue-awesome/icons/trash';
import 'vue-awesome/icons/plus';
import 'vue-awesome/icons/edit';

export default {
  name: "CategoryEditTree",
  props: {
    cls: Object,
    depth: {
      type: Number,
      default: 0,
    }
  },
  data: () => {
    return {
      expanded: true,
      editing: {
        id: 0, // FIXME: Use ID assigned to category in vuex store, in order for saves to be uniquely targeted
        name: null,
        rule: {},
        parent: [],
      },
    };
  },
  computed: {
    allCategories: function() {
      const categories = this.$store.getters["settings/all_categories"];
      const entries = categories.map(c => { return { text: c.join("->"), value: c } });
      return [{ value: [], text: 'None'}].concat(entries);
    },
    allRuleTypes: function() {
      return [
        { value: null, text: 'None' },
        { value: 'regex', text: 'Regular Expression' },
        { value: 'glob', text: 'Glob pattern' },
      ]
    },
  },
  methods: {
    addSubclass: function(parent) {
      this.$store.commit('settings/addClass', {name: parent.name.concat(["New class"]), rule: {type: "regex", pattern: "FILL ME"}});
    },
    removeClass: function(cls) {
      // TODO: Show a confirmation dialog
      // TODO: Remove children as well?
      // TODO: Move button to edit modal?
      this.$store.commit('settings/removeClass', cls);
    },
    showEditModal(event) {
      this.$refs.edit.show()
    },
    checkFormValidity() {
      // FIXME
      return true;
    },
    handleOk(event) {
      // Prevent modal from closing
      event.preventDefault()
      // Trigger submit handler
      this.handleSubmit()
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return
      }

      // Save the category
      const new_class = {
        id: this.editing.id,
        name: this.editing.parent.concat(this.editing.name),
        rule: this.editing.rule,
      };
      this.$store.commit("settings/updateClass", new_class);

      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.edit.hide()
      })
    },
    resetModal() {
      this.editing = {
        id: this.cls.id,
        name: this.cls.subname,
        rule: _.cloneDeep(this.cls.rule),
        parent: this.cls.parent ? this.cls.parent : [],
      };
      //console.log(this.editing);
    },
  }
}
</script>

<style scoped lang="scss">
.row.cls:hover {
  background-color: #EEE;
  boder-radius: 5px;
}
</style>
