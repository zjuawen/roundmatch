module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401569, function(require, module, exports) {
var __TEMP__ = require('./components/index.js');
var __TEMP__ = require('./utils/index.js');
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./components/virtual-list/index.js');Object.defineProperty(exports, 'VirtualList', { enumerable: true, configurable: true, get: function() { return __TEMP__.VirtualList; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./components/virtual-waterfall/index.js');Object.defineProperty(exports, 'VirtualWaterfall', { enumerable: true, configurable: true, get: function() { return __TEMP__.VirtualWaterfall; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils/convert.js');Object.defineProperty(exports, 'convertNumber2PX', { enumerable: true, configurable: true, get: function() { return __TEMP__.convertNumber2PX; } });Object.defineProperty(exports, 'convertPX2Int', { enumerable: true, configurable: true, get: function() { return __TEMP__.convertPX2Int; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils/dom.js');Object.defineProperty(exports, 'getRectSize', { enumerable: true, configurable: true, get: function() { return __TEMP__.getRectSize; } });Object.defineProperty(exports, 'getRectSizeSync', { enumerable: true, configurable: true, get: function() { return __TEMP__.getRectSizeSync; } });Object.defineProperty(exports, 'getScrollViewContextNode', { enumerable: true, configurable: true, get: function() { return __TEMP__.getScrollViewContextNode; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils/helper.js');Object.defineProperty(exports, 'defaultItemKey', { enumerable: true, configurable: true, get: function() { return __TEMP__.defaultItemKey; } });Object.defineProperty(exports, 'getOffsetForIndexAndAlignment', { enumerable: true, configurable: true, get: function() { return __TEMP__.getOffsetForIndexAndAlignment; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils/lodash.js');Object.defineProperty(exports, 'debounce', { enumerable: true, configurable: true, get: function() { return __TEMP__.debounce; } });Object.defineProperty(exports, 'omit', { enumerable: true, configurable: true, get: function() { return __TEMP__.omit; } });Object.defineProperty(exports, 'throttle', { enumerable: true, configurable: true, get: function() { return __TEMP__.throttle; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils/math.js');Object.defineProperty(exports, 'getMiddleNumber', { enumerable: true, configurable: true, get: function() { return __TEMP__.getMiddleNumber; } });Object.defineProperty(exports, 'isCosDistributing', { enumerable: true, configurable: true, get: function() { return __TEMP__.isCosDistributing; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils/timer.js');Object.defineProperty(exports, 'cancelTimeout', { enumerable: true, configurable: true, get: function() { return __TEMP__.cancelTimeout; } });Object.defineProperty(exports, 'requestTimeout', { enumerable: true, configurable: true, get: function() { return __TEMP__.requestTimeout; } });
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./components/index.js":1768876401570,"./utils/index.js":1768876401574,"./components/virtual-list/index.js":1768876401571,"./components/virtual-waterfall/index.js":1768876401591,"./utils/convert.js":1768876401575,"./utils/dom.js":1768876401576,"./utils/helper.js":1768876401577,"./utils/lodash.js":1768876401578,"./utils/math.js":1768876401579,"./utils/timer.js":1768876401580}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401570, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./virtual-list/index.js');Object.defineProperty(exports, 'VirtualList', { enumerable: true, configurable: true, get: function() { return __TEMP__.VirtualList; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./virtual-waterfall/index.js');Object.defineProperty(exports, 'VirtualWaterfall', { enumerable: true, configurable: true, get: function() { return __TEMP__.VirtualWaterfall; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./virtual-list/index.js":1768876401571,"./virtual-waterfall/index.js":1768876401591}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401571, function(require, module, exports) {
const VirtualList = (process.env.FRAMEWORK === 'vue' || process.env.FRAMEWORK === 'vue3')
    ? require('./vue').default
    : require('./react').default;

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'VirtualList', { enumerable: true, configurable: true, get: function() { return VirtualList; } });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return VirtualList; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./vue":1768876401572,"./react":1768876401587}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401572, function(require, module, exports) {
var __TEMP__ = require('./list.js');var List = __REQUIRE_DEFAULT__(__TEMP__);

const VirtualList = List;
function install(Vue) {
    Vue.component('virtual-list', VirtualList);
}
var index = {
    install
};

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'VirtualList', { enumerable: true, configurable: true, get: function() { return VirtualList; } });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return index; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./list.js":1768876401573}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401573, function(require, module, exports) {
var __TEMP__ = require('@tarojs/shared');var isNumber = __TEMP__['isNumber'];
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('vue');var defineComponent = __TEMP__['defineComponent'];
var __TEMP__ = require('../../../utils/index.js');
var __TEMP__ = require('../../../utils/vue-render.js');var render = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../constants.js');var IS_SCROLLING_DEBOUNCE_INTERVAL = __TEMP__['IS_SCROLLING_DEBOUNCE_INTERVAL'];
var __TEMP__ = require('../dom-helpers.js');var getRTLOffsetType = __TEMP__['getRTLOffsetType'];
var __TEMP__ = require('../preset.js');var Preset = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/dom.js');var getScrollViewContextNode = __TEMP__['getScrollViewContextNode'];var getRectSizeSync = __TEMP__['getRectSizeSync'];
var __TEMP__ = require('../../../utils/timer.js');var cancelTimeout = __TEMP__['cancelTimeout'];var requestTimeout = __TEMP__['requestTimeout'];
var __TEMP__ = require('../../../utils/helper.js');var defaultItemKey = __TEMP__['defaultItemKey'];
var __TEMP__ = require('../../../utils/convert.js');var convertNumber2PX = __TEMP__['convertNumber2PX'];
var __TEMP__ = require('../../../utils/lodash.js');var omit = __TEMP__['omit'];

var List = defineComponent({
    props: {
        id: String,
        height: {
            type: [String, Number],
            required: true
        },
        width: {
            type: [String, Number],
            required: true
        },
        item: {
            required: true
        },
        itemCount: {
            type: Number,
            required: true
        },
        itemData: {
            type: Array,
            required: true
        },
        itemKey: Function,
        itemSize: {
            type: [Number, Function],
            required: true
        },
        queryPrefix: {
            type: String,
            default: ''
        },
        unlimitedSize: {
            type: Boolean,
            default: false
        },
        position: {
            type: String,
            default: 'absolute'
        },
        direction: {
            type: String,
            default: 'ltr'
        },
        layout: {
            type: String,
            default: 'vertical'
        },
        initialScrollOffset: {
            type: Number,
            default: 0
        },
        overscanCount: {
            type: Number,
            default: 1
        },
        placeholderCount: {
            type: Number
        },
        useIsScrolling: {
            type: Boolean,
            default: false
        },
        enhanced: {
            type: Boolean,
            default: false
        },
        shouldResetStyleCacheOnItemSizeChange: {
            type: Boolean,
            default: true
        },
        outerElementType: {
            type: String,
            default: process.env.TARO_PLATFORM === 'web' ? 'taro-scroll-view-core' : 'scroll-view'
        },
        innerElementType: {
            type: String,
            default: process.env.TARO_PLATFORM === 'web' ? 'taro-view-core' : 'view'
        },
        itemElementType: {
            type: String,
            default: process.env.TARO_PLATFORM === 'web' ? 'taro-view-core' : 'view'
        },
        outerTagName: String,
        innerTagName: String,
        itemTagName: String,
        outerRef: String,
        innerRef: String,
        onScrollNative: Function,
        onItemsRendered: Function,
    },
    data() {
        const preset = new Preset(this.$props, this.refresh);
        const id = this.$props.id || preset.id;
        preset.updateWrapper(id);
        return {
            itemList: preset.itemList,
            preset,
            instance: this,
            isScrolling: false,
            scrollDirection: 'forward',
            scrollOffset: typeof this.$props.initialScrollOffset === 'number'
                ? this.$props.initialScrollOffset
                : 0,
            scrollUpdateWasRequested: false,
            resetIsScrollingTimeoutId: null,
            refreshCount: 0
        };
    },
    methods: {
        refresh() {
            this.refreshCount = this.refreshCount + 1;
        },
        scrollTo(scrollOffset = 0, enhanced = this.preset.enhanced) {
            scrollOffset = Math.max(0, scrollOffset);
            if (this.scrollOffset === scrollOffset)
                return;
            if (enhanced) {
                const isHorizontal = this.preset.isHorizontal;
                const option = {
                    animated: true,
                    duration: 300,
                };
                if (isHorizontal) {
                    option.left = scrollOffset;
                }
                else {
                    option.top = scrollOffset;
                }
                return getScrollViewContextNode(`${this.$props.queryPrefix}#${this.preset.id}`).then((node) => node.scrollTo(option));
            }
            this.scrollDirection = this.scrollOffset < scrollOffset ? 'forward' : 'backward';
            this.scrollOffset = scrollOffset;
            this.scrollUpdateWasRequested = true;
            this.$nextTick(this._resetIsScrollingDebounced);
        },
        scrollToItem(index, align = 'auto', enhanced = this.preset.enhanced) {
            const { itemCount } = this.$props;
            const { scrollOffset } = this.$data;
            index = Math.max(0, Math.min(index, itemCount - 1));
            this.scrollTo(this.itemList.getOffsetForIndexAndAlignment(index, align, scrollOffset), enhanced);
        },
        _callOnItemsRendered: memoizeOne(function (overscanStartIndex, overscanStopIndex, startIndex, stopIndex) {
            return this.$props.onItemsRendered({
                overscanStartIndex,
                overscanStopIndex,
                startIndex,
                stopIndex
            });
        }),
        _callOnScroll: memoizeOne(function (scrollDirection, scrollOffset, scrollUpdateWasRequested, detail) {
            this.$emit('scroll', {
                scrollDirection,
                scrollOffset,
                scrollUpdateWasRequested,
                detail
            });
        }),
        _callPropsCallbacks() {
            if (typeof this.$props.onItemsRendered === 'function') {
                if (this.$props.itemCount > 0) {
                    const [overscanStartIndex, overscanStopIndex, startIndex, stopIndex] = this._getRangeToRender();
                    this._callOnItemsRendered(overscanStartIndex, overscanStopIndex, startIndex, stopIndex);
                }
            }
            if (typeof this.$props.onScroll === 'function') {
                this._callOnScroll(this.scrollDirection, this.scrollOffset, this.scrollUpdateWasRequested, this.preset.field);
            }
            if (this.itemList.isUnlimitedMode) {
                setTimeout(() => {
                    const [startIndex, stopIndex] = this._getRangeToRender();
                    const isHorizontal = this.preset.isHorizontal;
                    for (let index = startIndex; index <= stopIndex; index++) {
                        this._getSizeUploadSync(index, isHorizontal);
                    }
                }, 0);
            }
        },
        _getSizeUploadSync(index, isHorizontal) {
            return new Promise((resolve) => {
                if (index >= 0 && index < this.$props.itemCount) {
                    const times = this.itemList.compareSize(index) ? 0 : 2;
                    getRectSizeSync(`${this.$props.queryPrefix}#${this.preset.id}-${index}`, 100, times).then(({ width, height }) => {
                        const size = isHorizontal ? width : height;
                        if (typeof size === 'number' && size > 0 && !this.itemList.compareSize(index, size)) {
                            this.itemList.setSize(index, size);
                            resolve(this.itemList.getSize(index));
                        }
                    });
                }
            });
        },
        _getRangeToRender() {
            return this.itemList.getRangeToRender(this.$data.scrollDirection, this.$data.scrollOffset, this.$data.isScrolling);
        },
        _onScrollHorizontal(event) {
            const { scrollHeight, scrollWidth = this.itemList.getOffsetSizeCache(), scrollTop, scrollLeft, } = event.currentTarget;
            if (!isNumber(scrollHeight) || !isNumber(scrollWidth))
                return;
            const clientWidth = this.itemList.wrapperSize;
            this.preset.field = {
                scrollHeight,
                scrollWidth,
                scrollTop,
                scrollLeft,
                clientHeight: scrollHeight,
                clientWidth: scrollWidth
            };
            if (this.$props.onScrollNative) {
                this.$props.onScrollNative(event);
            }
            const diffOffset = this.preset.field.scrollLeft - scrollLeft;
            if (this.scrollOffset === scrollLeft || this.preset.isShaking(diffOffset)) {
                return;
            }
            let scrollOffset = scrollLeft;
            if (this.preset.isRtl) {
                // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
                // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
                // It's also easier for this component if we convert offsets to the same format as they would be in for ltr.
                // So the simplest solution is to determine which browser behavior we're dealing with, and convert based on it.
                switch (getRTLOffsetType()) {
                    case 'negative':
                        scrollOffset = -scrollLeft;
                        break;
                    case 'positive-descending':
                        scrollOffset = scrollWidth - clientWidth - scrollLeft;
                        break;
                }
            }
            // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
            scrollOffset = Math.max(0, Math.min(scrollOffset, scrollWidth - clientWidth));
            this.preset.field = {
                scrollWidth: scrollOffset,
            };
            this.isScrolling = true;
            this.scrollDirection = this.scrollOffset < scrollLeft ? 'forward' : 'backward';
            this.scrollOffset = scrollOffset;
            this.scrollUpdateWasRequested = false;
            this.$nextTick(this._resetIsScrollingDebounced);
        },
        _onScrollVertical(event) {
            const { scrollHeight = this.itemList.getOffsetSizeCache(), scrollWidth, scrollTop, scrollLeft, } = event.currentTarget;
            if (!isNumber(scrollHeight) || !isNumber(scrollWidth))
                return;
            const clientHeight = this.itemList.wrapperSize;
            if (this.$props.onScrollNative) {
                this.$props.onScrollNative(event);
            }
            const diffOffset = this.preset.field.scrollTop - scrollTop;
            if (this.scrollOffset === scrollTop || this.preset.isShaking(diffOffset)) {
                return;
            }
            // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
            const scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
            this.preset.field = {
                scrollHeight,
                scrollWidth,
                scrollTop: scrollOffset,
                scrollLeft,
                clientHeight,
                clientWidth: scrollWidth,
                diffOffset: this.preset.field.scrollTop - scrollOffset,
            };
            this.isScrolling = true;
            this.scrollDirection = this.scrollOffset < scrollOffset ? 'forward' : 'backward';
            this.scrollOffset = scrollOffset;
            this.scrollUpdateWasRequested = false;
            this.$nextTick(this._resetIsScrollingDebounced);
        },
        _outerRefSetter(ref) {
            const { outerRef } = this.$props;
            this._outerRef = ref;
            if (typeof outerRef === 'function') {
                outerRef(ref);
            }
            else if (outerRef != null && typeof outerRef === 'object' && outerRef.hasOwnProperty('value')) {
                outerRef.value = ref;
            }
        },
        _resetIsScrollingDebounced() {
            if (this.resetIsScrollingTimeoutId !== null) {
                cancelTimeout(this.resetIsScrollingTimeoutId);
            }
            this.resetIsScrollingTimeoutId = requestTimeout(this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL);
        },
        _resetIsScrolling() {
            this.resetIsScrollingTimeoutId = null;
            this.isScrolling = false;
            this.$nextTick(() => {
                this.preset.resetCache();
            });
        },
        getRenderItemNode(index, type = 'node') {
            const { item, itemData, itemKey = defaultItemKey, useIsScrolling } = this.$props;
            const { isScrolling } = this.$data;
            const key = itemKey(index, itemData);
            const style = this.preset.getItemStyle(index);
            if (type === 'placeholder') {
                return render(this.preset.itemElement, {
                    key,
                    id: `${this.preset.id}-${index}-wrapper`,
                    style: this.preset.isBrick ? style : { display: 'none' }
                });
            }
            return render(this.preset.itemElement, {
                key: itemKey(index, itemData),
                id: `${this.preset.id}-${index}-wrapper`,
                style
            }, render(item, {
                id: `${this.preset.id}-${index}`,
                data: itemData,
                index,
                isScrolling: useIsScrolling ? isScrolling : undefined
            }));
        },
        getRenderColumnNode() {
            const { isScrolling } = this.$data;
            const { innerRef, itemCount } = this.$props;
            const isHorizontal = this.preset.isHorizontal;
            // Read this value AFTER items have been created,
            // So their actual sizes (if variable) are taken into consideration.
            const estimatedTotalSize = convertNumber2PX(this.itemList.getOffsetSize());
            const columnProps = {
                ref: innerRef,
                key: `${this.preset.id}-inner`,
                id: `${this.preset.id}-inner`,
                style: {
                    height: isHorizontal ? '100%' : estimatedTotalSize,
                    width: !isHorizontal ? '100%' : estimatedTotalSize,
                    position: 'relative',
                    pointerEvents: isScrolling ? 'none' : 'auto',
                }
            };
            const [startIndex, stopIndex] = this._getRangeToRender();
            const items = [];
            if (this.preset.isRelative && !this.preset.isBrick) {
                const pre = convertNumber2PX(this.itemList.getOffsetSizeCache(startIndex));
                items.push(render(this.preset.itemElement, {
                    key: `${this.preset.id}-pre`,
                    id: `${this.preset.id}-pre`,
                    style: {
                        height: isHorizontal ? '100%' : pre,
                        width: !isHorizontal ? '100%' : pre
                    }
                }));
            }
            const placeholderCount = this.preset.placeholderCount;
            const restCount = itemCount - stopIndex;
            const prevPlaceholder = startIndex < placeholderCount ? startIndex : placeholderCount;
            const postPlaceholder = restCount < placeholderCount ? restCount : placeholderCount;
            for (let itemIndex = 0; itemIndex < stopIndex + postPlaceholder; itemIndex++) {
                if (!this.preset.isBrick) {
                    if (itemIndex < startIndex - prevPlaceholder) {
                        itemIndex = startIndex - prevPlaceholder;
                        continue;
                    }
                }
                if (itemIndex < startIndex || itemIndex > stopIndex) {
                    items.push(this.getRenderItemNode(itemIndex, 'placeholder'));
                }
                else {
                    items.push(this.getRenderItemNode(itemIndex));
                }
            }
            return render(this.preset.innerElement, columnProps, items);
        },
        getRenderExpandNodes(direction) {
            const isHorizontal = this.preset.isHorizontal;
            const isRtl = this.preset.isRtl;
            const props = {
                id: `${this.preset.id}-${direction}`,
                style: {
                    visibility: 'hidden',
                    height: isHorizontal ? '100%' : 100,
                    width: isHorizontal ? 100 : '100%',
                    [isHorizontal ? isRtl ? 'marginRight' : 'marginLeft' : 'marginTop']: -100,
                    zIndex: -1,
                }
            };
            return render(this.preset.innerElement, props);
        }
    },
    mounted() {
        const { initialScrollOffset } = this.$props;
        if (typeof initialScrollOffset === 'number' && this._outerRef != null) {
            const outerRef = this._outerRef;
            if (this.preset.isHorizontal) {
                outerRef.scrollLeft = initialScrollOffset;
            }
            else {
                outerRef.scrollTop = initialScrollOffset;
            }
        }
        this._callPropsCallbacks();
        this.preset.boundaryDetection();
    },
    updated() {
        this.preset.update(this.$props);
        const { scrollOffset, scrollUpdateWasRequested } = this.$data;
        if (scrollUpdateWasRequested && this._outerRef != null) {
            const outerRef = this._outerRef;
            if (this.preset.isHorizontal) {
                if (this.preset.isRtl) {
                    // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
                    // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
                    // So we need to determine which browser behavior we're dealing with, and mimic it.
                    switch (getRTLOffsetType()) {
                        case 'negative':
                            outerRef.scrollLeft = -scrollOffset;
                            break;
                        case 'positive-ascending':
                            outerRef.scrollLeft = scrollOffset;
                            break;
                        default: {
                            const { clientWidth, scrollWidth } = outerRef;
                            outerRef.scrollLeft = scrollWidth - clientWidth - scrollOffset;
                            break;
                        }
                    }
                }
                else {
                    outerRef.scrollLeft = scrollOffset;
                }
            }
            else {
                outerRef.scrollTop = scrollOffset;
            }
        }
        this._callPropsCallbacks();
    },
    beforeDestroy() {
        if (this.resetIsScrollingTimeoutId !== null) {
            cancelTimeout(this.resetIsScrollingTimeoutId);
        }
        this.preset.dispose();
    },
    render() {
        var _a, _b, _c, _d;
        const { direction, height, layout, width, enhanced = false } = omit(this.$props, [
            'item', 'itemCount', 'itemData', 'itemKey', 'useIsScrolling',
            'innerElementType', 'innerTagName', 'itemElementType', 'itemTagName',
            'outerElementType', 'outerTagName', 'onScrollToLower', 'onScrollToUpper',
            'upperThreshold', 'lowerThreshold',
            'position', 'innerRef',
        ]);
        const { scrollOffset, scrollUpdateWasRequested } = this.$data;
        const isHorizontal = this.preset.isHorizontal;
        const isRtl = this.preset.isRtl;
        const outerElementProps = {
            id: this.preset.id,
            ref: this._outerRefSetter,
            layout,
            enhanced,
            style: {
                position: 'relative',
                height: convertNumber2PX(height),
                width: convertNumber2PX(width),
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                willChange: 'transform',
                direction
            },
            attrs: {
                scrollY: !this.preset.isHorizontal,
                scrollX: this.preset.isHorizontal
            },
            on: {
                scroll: isHorizontal
                    ? this._onScrollHorizontal
                    : this._onScrollVertical
            }
        };
        if (!enhanced) {
            if (isHorizontal) {
                outerElementProps.scrollLeft = scrollUpdateWasRequested ? scrollOffset : this.preset.field.scrollLeft;
            }
            else {
                outerElementProps.scrollTop = scrollUpdateWasRequested ? scrollOffset : this.preset.field.scrollTop;
            }
        }
        return render(this.preset.outerElement, outerElementProps, [
            this.getRenderExpandNodes(isHorizontal ? isRtl ? 'right' : 'left' : 'top'),
            process.env.FRAMEWORK === 'vue3' ? (_b = (_a = this.$slots).top) === null || _b === void 0 ? void 0 : _b.call(_a) : this.$slots.top,
            this.getRenderColumnNode(),
            process.env.FRAMEWORK === 'vue3' ? (_d = (_c = this.$slots).bottom) === null || _d === void 0 ? void 0 : _d.call(_c) : this.$slots.bottom,
            this.getRenderExpandNodes(isHorizontal ? isRtl ? 'left' : 'right' : 'bottom'),
        ]);
    }
});

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return List; } });
//# sourceMappingURL=list.js.map

}, function(modId) { var map = {"../../../utils/index.js":1768876401574,"../../../utils/vue-render.js":1768876401581,"../constants.js":1768876401582,"../dom-helpers.js":1768876401583,"../preset.js":1768876401584,"../../../utils/dom.js":1768876401576,"../../../utils/timer.js":1768876401580,"../../../utils/helper.js":1768876401577,"../../../utils/convert.js":1768876401575,"../../../utils/lodash.js":1768876401578}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401574, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./convert.js');Object.defineProperty(exports, 'convertNumber2PX', { enumerable: true, configurable: true, get: function() { return __TEMP__.convertNumber2PX; } });Object.defineProperty(exports, 'convertPX2Int', { enumerable: true, configurable: true, get: function() { return __TEMP__.convertPX2Int; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./dom.js');Object.defineProperty(exports, 'getRectSize', { enumerable: true, configurable: true, get: function() { return __TEMP__.getRectSize; } });Object.defineProperty(exports, 'getRectSizeSync', { enumerable: true, configurable: true, get: function() { return __TEMP__.getRectSizeSync; } });Object.defineProperty(exports, 'getScrollViewContextNode', { enumerable: true, configurable: true, get: function() { return __TEMP__.getScrollViewContextNode; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./helper.js');Object.defineProperty(exports, 'defaultItemKey', { enumerable: true, configurable: true, get: function() { return __TEMP__.defaultItemKey; } });Object.defineProperty(exports, 'getOffsetForIndexAndAlignment', { enumerable: true, configurable: true, get: function() { return __TEMP__.getOffsetForIndexAndAlignment; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./lodash.js');Object.defineProperty(exports, 'debounce', { enumerable: true, configurable: true, get: function() { return __TEMP__.debounce; } });Object.defineProperty(exports, 'omit', { enumerable: true, configurable: true, get: function() { return __TEMP__.omit; } });Object.defineProperty(exports, 'throttle', { enumerable: true, configurable: true, get: function() { return __TEMP__.throttle; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./math.js');Object.defineProperty(exports, 'getMiddleNumber', { enumerable: true, configurable: true, get: function() { return __TEMP__.getMiddleNumber; } });Object.defineProperty(exports, 'isCosDistributing', { enumerable: true, configurable: true, get: function() { return __TEMP__.isCosDistributing; } });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./timer.js');Object.defineProperty(exports, 'cancelTimeout', { enumerable: true, configurable: true, get: function() { return __TEMP__.cancelTimeout; } });Object.defineProperty(exports, 'requestTimeout', { enumerable: true, configurable: true, get: function() { return __TEMP__.requestTimeout; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./convert.js":1768876401575,"./dom.js":1768876401576,"./helper.js":1768876401577,"./lodash.js":1768876401578,"./math.js":1768876401579,"./timer.js":1768876401580}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401575, function(require, module, exports) {
/** 将距离值根据单位转换为 Number 类型
 * TODO: 未来可以考虑支持更多单位
 */
function convertPX2Int(distance) {
    if (typeof distance === 'string') {
        const str = distance.toLowerCase();
        if (/px$/.test(str)) {
            return Number(str.replace(/px$/, ''));
        }
    }
    return distance;
}
function convertNumber2PX(styleValue) {
    if (!styleValue && styleValue !== 0)
        return '';
    return typeof styleValue === 'number' ? styleValue + 'px' : styleValue;
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'convertNumber2PX', { enumerable: true, configurable: true, get: function() { return convertNumber2PX; } });Object.defineProperty(exports, 'convertPX2Int', { enumerable: true, configurable: true, get: function() { return convertPX2Int; } });
//# sourceMappingURL=convert.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401576, function(require, module, exports) {
var __TEMP__ = require('@tarojs/taro');var createSelectorQuery = __TEMP__['createSelectorQuery'];

function getRectSize(id, success, fail, retryMs = 500) {
    const query = createSelectorQuery();
    try {
        query.select(id).boundingClientRect((res) => {
            if (res) {
                success === null || success === void 0 ? void 0 : success(res);
            }
            else {
                fail === null || fail === void 0 ? void 0 : fail();
            }
        }).exec();
    }
    catch (err) {
        setTimeout(() => {
            getRectSize(id, success, fail, retryMs);
        }, retryMs);
    }
}
function getRectSizeSync(id, retryMs = 500, retryTimes = 5) {
    return new Promise((resolve) => {
        function retry() {
            if (retryTimes <= 0)
                return;
            setTimeout(async () => {
                try {
                    const res = await getRectSizeSync(id, retryMs, --retryTimes);
                    resolve(res);
                }
                catch (err) {
                    retry();
                }
            }, retryMs);
        }
        getRectSize(id, resolve, retry, retryMs);
    });
}
async function getScrollViewContextNode(id) {
    const query = createSelectorQuery();
    return new Promise((resolve) => query.select(id).node(({ node }) => resolve(node)).exec());
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'getRectSize', { enumerable: true, configurable: true, get: function() { return getRectSize; } });Object.defineProperty(exports, 'getRectSizeSync', { enumerable: true, configurable: true, get: function() { return getRectSizeSync; } });Object.defineProperty(exports, 'getScrollViewContextNode', { enumerable: true, configurable: true, get: function() { return getScrollViewContextNode; } });
//# sourceMappingURL=dom.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401577, function(require, module, exports) {
// In DEV mode, this Set helps us only log a warning once per component instance.
// This avoids spamming the console every time a render happens.
const defaultItemKey = (index, _itemData) => index;
function getOffsetForIndexAndAlignment({ align = 'auto', containerSize = 0, currentOffset = 0, scrollSize = 0, slideSize = 0, targetOffset = 0, }) {
    const lastItemOffset = Math.max(0, scrollSize - containerSize);
    const maxOffset = Math.min(lastItemOffset, targetOffset);
    const minOffset = Math.max(0, targetOffset - containerSize + slideSize);
    if (align === 'smart') {
        if (currentOffset >= minOffset - containerSize && currentOffset <= maxOffset + containerSize) {
            align = 'auto';
        }
        else {
            align = 'center';
        }
    }
    switch (align) {
        case 'start':
            return maxOffset;
        case 'end':
            return minOffset;
        case 'center':
            {
                // "Centered" offset is usually the average of the min and max.
                // But near the edges of the list, this doesn't hold true.
                const middleOffset = Math.round(minOffset + (maxOffset - minOffset) / 2);
                if (middleOffset < Math.ceil(containerSize / 2)) {
                    return 0; // near the beginning
                }
                else if (middleOffset > lastItemOffset + Math.floor(containerSize / 2)) {
                    return lastItemOffset; // near the end
                }
                else {
                    return middleOffset;
                }
            }
        case 'auto':
        default:
            if (currentOffset >= minOffset && currentOffset <= maxOffset) {
                return currentOffset;
            }
            else if (currentOffset < minOffset) {
                return minOffset;
            }
            else {
                return maxOffset;
            }
    }
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'defaultItemKey', { enumerable: true, configurable: true, get: function() { return defaultItemKey; } });Object.defineProperty(exports, 'getOffsetForIndexAndAlignment', { enumerable: true, configurable: true, get: function() { return getOffsetForIndexAndAlignment; } });
//# sourceMappingURL=helper.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401578, function(require, module, exports) {
function omit(obj = {}, fields = []) {
    const shallow = Object.assign({}, obj);
    fields.forEach((key) => {
        delete shallow[key];
    });
    return shallow;
}
function throttle(fn, threshold = 250, scope) {
    let lastTime = 0;
    let deferTimer;
    return function (...args) {
        const context = scope || this;
        const now = Date.now();
        if (now - lastTime > threshold) {
            fn.apply(this, args);
            lastTime = now;
        }
        else {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(() => {
                lastTime = now;
                fn.apply(context, args);
            }, threshold);
        }
    };
}
function debounce(fn, ms = 250, scope) {
    let timer;
    return function (...args) {
        const context = scope || this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, ms);
    };
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'debounce', { enumerable: true, configurable: true, get: function() { return debounce; } });Object.defineProperty(exports, 'omit', { enumerable: true, configurable: true, get: function() { return omit; } });Object.defineProperty(exports, 'throttle', { enumerable: true, configurable: true, get: function() { return throttle; } });
//# sourceMappingURL=lodash.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401579, function(require, module, exports) {
function getMiddleNumber(...list) {
    return list.sort((a, b) => a - b)[Math.floor(list.length / 2)];
}
function isCosDistributing(list, datum = 0) {
    let flags = 0;
    for (let i = 0; i < list.length - 1; i++) {
        if (getMiddleNumber(list[i], datum, list[i + 1]) === datum) {
            flags++;
        }
    }
    return flags === list.length - 1;
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'getMiddleNumber', { enumerable: true, configurable: true, get: function() { return getMiddleNumber; } });Object.defineProperty(exports, 'isCosDistributing', { enumerable: true, configurable: true, get: function() { return isCosDistributing; } });
//# sourceMappingURL=math.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401580, function(require, module, exports) {
var __TEMP__ = require('@tarojs/runtime');var cancelAnimationFrame = __TEMP__['cancelAnimationFrame'];var now = __TEMP__['now'];var requestAnimationFrame = __TEMP__['requestAnimationFrame'];

function cancelTimeout(timeoutID) {
    cancelAnimationFrame(timeoutID.id);
}
function requestTimeout(callback, delay = 0) {
    const start = now();
    const timeoutID = {
        id: requestAnimationFrame(tick)
    };
    function tick() {
        if (now() - start >= delay) {
            // eslint-disable-next-line no-useless-call
            callback.call(null);
        }
        else {
            timeoutID.id = requestAnimationFrame(tick);
        }
    }
    return timeoutID;
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'cancelTimeout', { enumerable: true, configurable: true, get: function() { return cancelTimeout; } });Object.defineProperty(exports, 'requestTimeout', { enumerable: true, configurable: true, get: function() { return requestTimeout; } });
//# sourceMappingURL=timer.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401581, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('vue');var h = __TEMP__['h'];

function render (componentName, options, children) {
    const { attrs = {}, on = {}, props = {}, slots = {} } = options, el = __rest(options, ["attrs", "on", "props", "slots"]);
    if (process.env.FRAMEWORK === 'vue3') {
        // Events
        Object.keys(on).forEach(key => {
            const name = `on${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            el[name] = on[key];
        });
        return h(componentName, Object.assign(Object.assign(Object.assign(Object.assign({}, attrs), props), slots), el), children);
    }
    return h(componentName, options, children);
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return render; } });
//# sourceMappingURL=vue-render.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401582, function(require, module, exports) {
const IS_SCROLLING_DEBOUNCE_INTERVAL = 200;

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'IS_SCROLLING_DEBOUNCE_INTERVAL', { enumerable: true, configurable: true, get: function() { return IS_SCROLLING_DEBOUNCE_INTERVAL; } });
//# sourceMappingURL=constants.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401583, function(require, module, exports) {
// TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
// Chrome does not seem to adhere; its scrollLeft values are positive (measured relative to the left).
// Safari's elastic bounce makes detecting this even more complicated wrt potential false positives.
// The safest way to check this is to intentionally set a negative offset,
// and then verify that the subsequent "scroll" event matches the negative offset.
// If it does not match, then we can assume a non-standard RTL scroll implementation.
let cachedRTLResult = null;
function getRTLOffsetType(recalculate = false) {
    if (cachedRTLResult === null || recalculate) {
        const outerDiv = document.createElement('div');
        const outerStyle = outerDiv.style;
        outerStyle.width = '50px';
        outerStyle.height = '50px';
        outerStyle.overflow = 'scroll';
        outerStyle.direction = 'rtl';
        const innerDiv = document.createElement('div');
        const innerStyle = innerDiv.style;
        innerStyle.width = '100px';
        innerStyle.height = '100px';
        outerDiv.appendChild(innerDiv);
        document.body.appendChild(outerDiv);
        if (outerDiv.scrollLeft > 0) {
            cachedRTLResult = 'positive-descending';
        }
        else {
            outerDiv.scrollLeft = 1;
            if (outerDiv.scrollLeft === 0) {
                cachedRTLResult = 'negative';
            }
            else {
                cachedRTLResult = 'positive-ascending';
            }
        }
        document.body.removeChild(outerDiv);
        return cachedRTLResult;
    }
    return cachedRTLResult;
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'getRTLOffsetType', { enumerable: true, configurable: true, get: function() { return getRTLOffsetType; } });
//# sourceMappingURL=dom-helpers.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401584, function(require, module, exports) {
var __TEMP__ = require('@tarojs/taro');var createSelectorQuery = __TEMP__['createSelectorQuery'];var getCurrentInstance = __TEMP__['getCurrentInstance'];var createIntersectionObserver = __TEMP__['createIntersectionObserver'];
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../utils/index.js');
var __TEMP__ = require('./list-set.js');var ListSet = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./utils.js');var isHorizontalFunc = __TEMP__['isHorizontalFunc'];var isRtlFunc = __TEMP__['isRtlFunc'];
var __TEMP__ = require('../../utils/convert.js');var convertNumber2PX = __TEMP__['convertNumber2PX'];
var __TEMP__ = require('../../utils/dom.js');var getRectSizeSync = __TEMP__['getRectSizeSync'];
var __TEMP__ = require('../../utils/math.js');var isCosDistributing = __TEMP__['isCosDistributing'];
var __TEMP__ = require('../../utils/lodash.js');var throttle = __TEMP__['throttle'];

let INSTANCE_ID = 0;
class Preset {
    constructor(props, refresh) {
        this.props = props;
        this.refresh = refresh;
        this._observer = {};
        this.wrapperField = {
            scrollLeft: 0,
            scrollTop: 0,
            scrollHeight: 0,
            scrollWidth: 0,
            clientHeight: 0,
            clientWidth: 0,
            diffOffset: 0
        };
        this.diffList = [0, 0, 0];
        this.getItemStyleCache = memoizeOne((itemIndex, itemSize, _flag = this.itemList.refreshCounter) => {
            itemSize = itemSize || this.itemList.getSize(itemIndex);
            const style = this.isRelative ? {} : {
                position: 'absolute',
            };
            const offset = convertNumber2PX(this.itemList.getOffsetSizeCache(itemIndex));
            const size = convertNumber2PX(this.itemList.getSize(itemIndex));
            const isHorizontal = this.isHorizontal;
            const isRtl = this.isRtl;
            style.height = !isHorizontal ? size : '100%';
            style.width = isHorizontal ? size : '100%';
            if (!this.isRelative) {
                const offsetHorizontal = isHorizontal ? offset : 0;
                style.top = !isHorizontal ? offset : 0;
                if (isRtl) {
                    style.right = offsetHorizontal;
                }
                else {
                    style.left = offsetHorizontal;
                }
            }
            return style;
        });
        this.init(this.props);
        this.itemList = new ListSet(props, refresh);
    }
    init(props) {
        this.props = props;
    }
    update(props) {
        this.props = props;
        this.itemList.update(props);
    }
    async updateWrapper(id) {
        var _a;
        var _b, _c;
        this.id = id;
        const { width = 0, height = 0 } = this.props;
        const validWidth = typeof width === 'number' && width > 0;
        const validHeight = typeof height === 'number' && height > 0;
        if (validWidth) {
            this.itemList.wrapperWidth = width;
        }
        if (validHeight) {
            this.itemList.wrapperHeight = height;
        }
        if (!validHeight || !validWidth) {
            const res = await getRectSizeSync(`#${id}`, 100);
            (_b = this.itemList).wrapperWidth || (_b.wrapperWidth = res.width);
            (_c = this.itemList).wrapperHeight || (_c.wrapperHeight = res.height);
            (_a = this.refresh) === null || _a === void 0 ? void 0 : _a.call(this);
        }
        this.itemList.update(this.props);
    }
    set id(id) {
        this._id = id;
    }
    get id() {
        this._id || (this._id = `virtual-waterfall-${INSTANCE_ID++}`);
        return this._id;
    }
    get isHorizontal() {
        return isHorizontalFunc(this.props);
    }
    get isRtl() {
        return isRtlFunc(this.props);
    }
    get isRelative() {
        return this.props.position && this.props.position !== 'absolute';
    }
    get isBrick() {
        return this.props.position === 'brick';
    }
    get placeholderCount() {
        return this.props.placeholderCount >= 0 ? this.props.placeholderCount : this.props.overscanCount;
    }
    get outerElement() {
        return this.props.outerElementType || this.props.outerTagName || 'div';
    }
    get innerElement() {
        return this.props.innerElementType || this.props.innerTagName || 'div';
    }
    get itemElement() {
        return this.props.itemElementType || this.props.itemTagName || 'div';
    }
    get field() {
        return this.wrapperField;
    }
    set field(o) {
        Object.assign(this.wrapperField, o);
        // Object.keys(o).forEach(key => {
        //   if (typeof o[key] === 'number' && typeof this.wrapperField[key] === 'number') {
        //     this.wrapperField[key] = o[key]
        //   }
        // })
    }
    get enhanced() {
        return this.props.enhanced || true;
    }
    isShaking(diff) {
        if (process.env.TARO_PLATFORM === 'web' || this.props.enhanced)
            return false;
        const list = this.diffList.slice(-3);
        this.diffList.push(diff);
        return list.findIndex(e => Math.abs(e) === Math.abs(diff)) !== -1 || isCosDistributing(this.diffList.slice(-4));
    }
    resetCache() {
        this.itemList.refreshCounter++;
    }
    getItemStyle(index) {
        const { shouldResetStyleCacheOnItemSizeChange } = this.props;
        return this.getItemStyleCache(index, shouldResetStyleCacheOnItemSizeChange ? this.itemList.getSize(index) : false);
    }
    boundaryDetection() {
        if ([typeof this.props.onScrollToUpper, typeof this.props.onScrollToLower].every(e => e !== 'function'))
            return;
        createSelectorQuery().select(`#${this.id}`).node().exec(() => {
            const upperObserver = this.boundaryDetectionHelper({
                event: typeof this.props.onScrollToUpper === 'function' ? () => {
                    if (this.field.diffOffset >= 0)
                        this.props.onScrollToUpper();
                } : undefined,
                id: `${this.id}-${this.isHorizontal ? this.isRtl ? 'right' : 'left' : 'top'}`,
            });
            if (upperObserver) {
                this._observer.top = upperObserver;
            }
            const lowerObserver = this.boundaryDetectionHelper({
                event: typeof this.props.onScrollToLower === 'function' ? () => {
                    if (this.field.diffOffset <= 0)
                        this.props.onScrollToLower();
                } : undefined,
                id: `${this.id}-${this.isHorizontal ? this.isRtl ? 'left' : 'right' : 'bottom'}`,
            });
            if (lowerObserver) {
                this._observer.bottom = lowerObserver;
            }
        });
    }
    boundaryDetectionHelper({ component, event, id, }) {
        if (typeof event !== 'function')
            return;
        const eventFunc = throttle(event);
        component || (component = getCurrentInstance().page);
        const observer = createIntersectionObserver(component, {
            thresholds: [0.4],
        });
        observer
            .relativeTo(`#${this.id}`, {
            top: typeof this.props.lowerThreshold === 'number' ? this.props.lowerThreshold : 50,
            bottom: typeof this.props.upperThreshold === 'number' ? this.props.upperThreshold : 50,
        })
            .observe(`#${id}`, eventFunc);
        return observer;
    }
    dispose() {
        Object.values(this._observer).forEach(e => { var _a; return (_a = e.disconnect) === null || _a === void 0 ? void 0 : _a.call(e); });
        this._observer = {};
    }
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return Preset; } });
//# sourceMappingURL=preset.js.map

}, function(modId) { var map = {"../../utils/index.js":1768876401574,"./list-set.js":1768876401585,"./utils.js":1768876401586,"../../utils/convert.js":1768876401575,"../../utils/dom.js":1768876401576,"../../utils/math.js":1768876401579,"../../utils/lodash.js":1768876401578}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401585, function(require, module, exports) {
var __TEMP__ = require('@tarojs/shared');var isFunction = __TEMP__['isFunction'];
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../utils/index.js');
var __TEMP__ = require('./utils.js');var isHorizontalFunc = __TEMP__['isHorizontalFunc'];
var __TEMP__ = require('../../utils/helper.js');var getOffsetForIndexAndAlignment = __TEMP__['getOffsetForIndexAndAlignment'];

class ListSet {
    constructor(props, refresh) {
        this.props = props;
        this.refresh = refresh;
        this.list = [];
        this.defaultSize = 1;
        this.wrapperHeight = 0;
        this.wrapperWidth = 0;
        this.refreshCounter = 0;
        this.getOffsetSizeCache = memoizeOne((i = this.list.length, _flag = this.refreshCounter) => {
            return this.getOffsetSize(i);
        });
        this.update(props);
        // Note: 不考虑列表模式切换情况，可能会导致列表抖动体验过差
        if (this.props.unlimitedSize) {
            this.mode = 'unlimited';
        }
        else if (isFunction(this.props.itemSize)) {
            this.mode = 'function';
        }
        else {
            this.mode = 'normal';
        }
        this.defaultSize = (isFunction(this.props.itemSize) ? this.props.itemSize() : this.props.itemSize) || 1;
        if (!this.isNormalMode) {
            this.list = new Array(this.length).fill(-1);
        }
    }
    get isNormalMode() {
        return this.mode === 'normal';
    }
    get isFunctionMode() {
        return this.mode === 'function';
    }
    get isUnlimitedMode() {
        return this.mode === 'unlimited';
    }
    get length() {
        return this.props.itemCount || 100;
    }
    get overscan() {
        return this.props.overscanCount || 0;
    }
    get wrapperSize() {
        return isHorizontalFunc(this.props) ? this.wrapperWidth : this.wrapperHeight;
    }
    update(props) {
        this.props = props;
        if (this.length > this.list.length) {
            const arr = new Array(this.length - this.list.length).fill(-1);
            this.list.push(...arr);
        }
        else if (this.length < this.list.length) {
            this.list.length = this.length;
        }
    }
    setSize(i = 0, size = this.defaultSize) {
        var _a;
        this.list[i] = size;
        (_a = this.refresh) === null || _a === void 0 ? void 0 : _a.call(this);
        this.refreshCounter++;
    }
    getSize(i = 0) {
        const size = this.props.itemSize;
        const item = this.list[i];
        if (item >= 0)
            return item;
        if (this.isFunctionMode && isFunction(size)) {
            const itemSize = size(i, this.props.itemData);
            this.setSize(i, itemSize);
            return itemSize;
        }
        return this.defaultSize;
    }
    getOffsetSize(i = this.list.length) {
        if (this.isNormalMode)
            return i * this.defaultSize;
        return this.list.slice(0, i).reduce((sum, _, idx) => sum + this.getSize(idx), 0);
    }
    getSizeCount(offset = 0) {
        if (offset === 0)
            return 0;
        // if (this.isNormalMode) {
        //   return Math.min(this.length - 1, Math.floor(offset / this.length))
        // }
        let offsetSize = 0;
        const count = this.list.reduce((sum, _, idx) => {
            if (offsetSize < offset) {
                offsetSize += this.getSize(idx);
                return ++sum;
            }
            return sum;
        }, 0);
        return count - 1;
    }
    getStartIndex(scrollOffset = 0) {
        return Math.max(0, this.getSizeCount(scrollOffset) - 1);
    }
    getStopIndex(wrapperSize = 0, scrollOffset = 0, startIndex = 0) {
        // const visibleOffset = this.getOffsetSizeCache(startIndex)
        // if (this.isNormalMode) {
        //   const numVisibleItems = Math.ceil((wrapperSize + scrollOffset - visibleOffset) / this.length)
        //   /** -1 is because stop index is inclusive */
        //   return Math.max(startIndex, Math.min(this.length - 1, startIndex + numVisibleItems - 1))
        // }
        return Math.max(startIndex, Math.min(this.length - 1, this.getSizeCount(wrapperSize + scrollOffset)));
    }
    getRangeToRender(direction, scrollOffset = 0, block = false) {
        if (this.length === 0) {
            return [0, 0, 0, 0];
        }
        const startIndex = this.getStartIndex(scrollOffset);
        const stopIndex = this.getStopIndex(this.wrapperSize, scrollOffset, startIndex);
        // Overscan by one item in each direction so that tab/focus works. If there isn't at least one extra item, tab loops back around.
        const overscanBackward = !block || direction === 'backward' ? Math.max(1, this.overscan) : 1;
        const overscanForward = !block || direction === 'forward' ? Math.max(1, this.overscan) : 1;
        return [
            Math.max(0, startIndex - overscanBackward),
            Math.max(0, Math.min(this.length - 1, stopIndex + overscanForward)),
            startIndex,
            stopIndex
        ];
    }
    getOffsetForIndexAndAlignment(index, align, scrollOffset) {
        return getOffsetForIndexAndAlignment({
            align,
            containerSize: this.wrapperSize,
            currentOffset: scrollOffset,
            scrollSize: this.getOffsetSizeCache(this.length),
            slideSize: this.getSize(index),
            targetOffset: this.getOffsetSizeCache(index),
        });
    }
    compareSize(i = 0, size = this.defaultSize) {
        if (this.isNormalMode)
            return true;
        return this.getSize(i) === size;
    }
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return ListSet; } });
//# sourceMappingURL=list-set.js.map

}, function(modId) { var map = {"../../utils/index.js":1768876401574,"./utils.js":1768876401586,"../../utils/helper.js":1768876401577}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401586, function(require, module, exports) {
function isHorizontalFunc({ direction, layout }) {
    return direction === 'horizontal' || layout === 'horizontal';
}
function isRtlFunc({ direction }) {
    return direction === 'rtl';
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'isHorizontalFunc', { enumerable: true, configurable: true, get: function() { return isHorizontalFunc; } });Object.defineProperty(exports, 'isRtlFunc', { enumerable: true, configurable: true, get: function() { return isRtlFunc; } });
//# sourceMappingURL=utils.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401587, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('@tarojs/components');var ScrollView = __TEMP__['ScrollView'];var View = __TEMP__['View'];
var __TEMP__ = require('react');var React = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./list.js');var List = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./wrapper.js');var outerWrapper = __REQUIRE_DEFAULT__(__TEMP__);

const VirtualList = React.forwardRef(function VirtualList(props, ref) {
    const _a = props, { direction = 'ltr', outerElementType = ScrollView, innerElementType = View, itemElementType = View, initialScrollOffset = 0, overscanCount = 1, queryPrefix = '' } = _a, rest = __rest(_a, ["direction", "outerElementType", "innerElementType", "itemElementType", "initialScrollOffset", "overscanCount", "queryPrefix"]);
    if ('children' in rest) {
        console.warn('Taro(VirtualList): children props have been deprecated. ' + 'Please use the item props instead.');
        rest.item = rest.children;
    }
    if (rest.item instanceof Array) {
        console.warn('Taro(VirtualList): item should not be an array');
        rest.item = rest.item[0];
    }
    return React.createElement(List, Object.assign(Object.assign({ ref }, rest), { outerElementType,
        itemElementType,
        innerElementType,
        direction,
        initialScrollOffset,
        overscanCount,
        queryPrefix,
        outerWrapper }));
});

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return VirtualList; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./list.js":1768876401588,"./wrapper.js":1768876401590}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401588, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('@tarojs/shared');var isNumber = __TEMP__['isNumber'];
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('react');var React = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/index.js');
var __TEMP__ = require('../constants.js');var IS_SCROLLING_DEBOUNCE_INTERVAL = __TEMP__['IS_SCROLLING_DEBOUNCE_INTERVAL'];
var __TEMP__ = require('../dom-helpers.js');var getRTLOffsetType = __TEMP__['getRTLOffsetType'];
var __TEMP__ = require('../preset.js');var Preset = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./validate.js');var validateListProps = __TEMP__['validateListProps'];
var __TEMP__ = require('../../../utils/dom.js');var getRectSizeSync = __TEMP__['getRectSizeSync'];var getScrollViewContextNode = __TEMP__['getScrollViewContextNode'];
var __TEMP__ = require('../../../utils/timer.js');var cancelTimeout = __TEMP__['cancelTimeout'];var requestTimeout = __TEMP__['requestTimeout'];
var __TEMP__ = require('../../../utils/helper.js');var defaultItemKey = __TEMP__['defaultItemKey'];
var __TEMP__ = require('../../../utils/convert.js');var convertNumber2PX = __TEMP__['convertNumber2PX'];
var __TEMP__ = require('../../../utils/lodash.js');var omit = __TEMP__['omit'];

class List extends React.PureComponent {
    static getDerivedStateFromProps(nextProps, prevState) {
        return validateListProps(nextProps, prevState);
    }
    constructor(props) {
        super(props);
        this.refresh = () => {
            if (process.env.FRAMEWORK === 'preact') {
                this.forceUpdate();
            }
            else {
                this.setState(({ refreshCount }) => ({
                    refreshCount: ++refreshCount
                }));
            }
        };
        this._outerRef = undefined;
        this._resetIsScrollingTimeoutId = null;
        this._callOnItemsRendered = memoizeOne((overscanStartIndex, overscanStopIndex, startIndex, stopIndex) => this.props.onItemsRendered({
            overscanStartIndex,
            overscanStopIndex,
            startIndex,
            stopIndex
        }));
        this._callOnScroll = memoizeOne((scrollDirection, scrollOffset, scrollUpdateWasRequested, detail) => this.props.onScroll({
            scrollDirection,
            scrollOffset,
            scrollUpdateWasRequested,
            detail
        }));
        this._getSizeUploadSync = (index, isHorizontal) => {
            return new Promise((resolve) => {
                if (index >= 0 && index < this.props.itemCount) {
                    const times = this.itemList.compareSize(index) ? 3 : 0;
                    getRectSizeSync(`${this.props.queryPrefix}#${this.preset.id}-${index}`, 100, times).then(({ width, height }) => {
                        const size = isHorizontal ? width : height;
                        if (typeof size === 'number' && size > 0 && !this.itemList.compareSize(index, size)) {
                            this.itemList.setSize(index, size);
                            resolve(this.itemList.getSize(index));
                        }
                    });
                }
            });
        };
        this._onScrollHorizontal = event => {
            const { scrollHeight, scrollWidth = this.itemList.getOffsetSizeCache(), scrollTop, scrollLeft, } = event.currentTarget;
            if (!isNumber(scrollHeight) || !isNumber(scrollWidth))
                return;
            const clientWidth = this.itemList.wrapperSize;
            this.preset.field = {
                scrollHeight,
                scrollWidth,
                scrollTop,
                scrollLeft,
                clientHeight: scrollHeight,
                clientWidth: scrollWidth
            };
            this.setState((prevState) => {
                const diffOffset = this.preset.field.scrollLeft - scrollLeft;
                if (prevState.scrollOffset === scrollLeft || this.preset.isShaking(diffOffset)) {
                    // Scroll position may have been updated by cDM/cDU,
                    // In which case we don't need to trigger another render,
                    // And we don't want to update state.isScrolling.
                    return null;
                }
                let scrollOffset = scrollLeft;
                if (this.preset.isRtl) {
                    // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
                    // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
                    // It's also easier for this component if we convert offsets to the same format as they would be in for ltr.
                    // So the simplest solution is to determine which browser behavior we're dealing with, and convert based on it.
                    switch (getRTLOffsetType()) {
                        case 'negative':
                            scrollOffset = -scrollLeft;
                            break;
                        case 'positive-descending':
                            scrollOffset = scrollWidth - clientWidth - scrollLeft;
                            break;
                    }
                } // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
                this.preset.field = {
                    scrollWidth: scrollOffset,
                };
                return {
                    isScrolling: true,
                    scrollDirection: prevState.scrollOffset < scrollLeft ? 'forward' : 'backward',
                    scrollOffset,
                    scrollUpdateWasRequested: false
                };
            }, this._resetIsScrollingDebounced);
        };
        this._onScrollVertical = event => {
            const { scrollHeight = this.itemList.getOffsetSizeCache(), scrollWidth, scrollTop, scrollLeft } = event.currentTarget;
            if (!isNumber(scrollHeight) || !isNumber(scrollWidth))
                return;
            const clientHeight = this.itemList.wrapperSize;
            this.setState((prevState) => {
                const diffOffset = this.preset.field.scrollTop - scrollTop;
                if (prevState.scrollOffset === scrollTop || this.preset.isShaking(diffOffset)) {
                    // Scroll position may have been updated by cDM/cDU,
                    // In which case we don't need to trigger another render,
                    // And we don't want to update state.isScrolling.
                    return null;
                }
                // FIXME preact 中使用时，该组件会出现触底滚动事件重复触发导致的抖动问题，后续修复
                // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
                const scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
                this.preset.field = {
                    scrollHeight,
                    scrollWidth,
                    scrollTop: scrollOffset,
                    scrollLeft,
                    clientHeight,
                    clientWidth: scrollWidth,
                    diffOffset: this.preset.field.scrollTop - scrollOffset,
                };
                return {
                    isScrolling: true,
                    scrollDirection: prevState.scrollOffset < scrollOffset ? 'forward' : 'backward',
                    scrollOffset,
                    scrollUpdateWasRequested: false
                };
            }, this._resetIsScrollingDebounced);
        };
        this._outerRefSetter = ref => {
            const { outerRef } = this.props;
            this._outerRef = ref;
            if (typeof outerRef === 'function') {
                outerRef(ref);
            }
            else if (outerRef != null && typeof outerRef === 'object' && outerRef.hasOwnProperty('current')) {
                // @ts-ignore
                outerRef.current = ref;
            }
        };
        this._resetIsScrollingDebounced = () => {
            if (this._resetIsScrollingTimeoutId !== null) {
                cancelTimeout(this._resetIsScrollingTimeoutId);
            }
            this._resetIsScrollingTimeoutId = requestTimeout(this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL);
        };
        this._resetIsScrolling = () => {
            this._resetIsScrollingTimeoutId = null;
            this.setState({
                isScrolling: false
            }, () => {
                // Clear style cache after state update has been committed.
                // This way we don't break pure sCU for items that don't use isScrolling param.
                this.preset.resetCache();
            });
        };
        this.preset = new Preset(props, this.refresh);
        this.itemList = this.preset.itemList;
        const id = this.props.id || this.preset.id;
        this.preset.updateWrapper(id);
        this.state = {
            instance: this,
            isScrolling: false,
            scrollDirection: 'forward',
            scrollOffset: typeof this.props.initialScrollOffset === 'number'
                ? this.props.initialScrollOffset
                : 0,
            scrollUpdateWasRequested: false,
            refreshCount: 0,
        };
    }
    _callPropsCallbacks(prevProps = {}, prevState = {}) {
        if (typeof this.props.onItemsRendered === 'function') {
            if (this.props.itemCount > 0) {
                if (prevProps && prevProps.itemCount !== this.props.itemCount) {
                    const [overscanStartIndex, overscanStopIndex, startIndex, stopIndex] = this._getRangeToRender();
                    this._callOnItemsRendered(overscanStartIndex, overscanStopIndex, startIndex, stopIndex);
                }
            }
        }
        if (typeof this.props.onScroll === 'function') {
            if (!prevState ||
                prevState.scrollDirection !== this.state.scrollDirection ||
                prevState.scrollOffset !== this.state.scrollOffset ||
                prevState.scrollUpdateWasRequested !== this.state.scrollUpdateWasRequested) {
                this._callOnScroll(this.state.scrollDirection, this.state.scrollOffset, this.state.scrollUpdateWasRequested, this.preset.field);
            }
        }
        if (this.itemList.isUnlimitedMode) {
            setTimeout(() => {
                const [startIndex, stopIndex] = this._getRangeToRender();
                const isHorizontal = this.preset.isHorizontal;
                for (let index = startIndex; index <= stopIndex; index++) {
                    this._getSizeUploadSync(index, isHorizontal);
                }
            }, 0);
        }
    }
    // Lazily create and cache item styles while scrolling,
    // So that pure component sCU will prevent re-renders.
    // We maintain this cache, and pass a style prop rather than index,
    // So that List can clear cached styles and force item re-render if necessary.
    _getRangeToRender() {
        return this.itemList.getRangeToRender(this.state.scrollDirection, this.state.scrollOffset, this.state.isScrolling);
    }
    scrollTo(scrollOffset = 0, enhanced = this.preset.enhanced) {
        scrollOffset = Math.max(0, scrollOffset);
        if (this.state.scrollOffset === scrollOffset)
            return;
        if (enhanced) {
            const isHorizontal = this.preset.isHorizontal;
            const option = {
                animated: true,
                duration: 300,
            };
            if (isHorizontal) {
                option.left = scrollOffset;
            }
            else {
                option.top = scrollOffset;
            }
            return getScrollViewContextNode(`${this.props.queryPrefix}#${this.preset.id}`).then((node) => node.scrollTo(option));
        }
        this.setState((prevState) => {
            if (prevState.scrollOffset === scrollOffset) {
                return null;
            }
            return {
                scrollDirection: prevState.scrollOffset < scrollOffset ? 'forward' : 'backward',
                scrollOffset,
                scrollUpdateWasRequested: true
            };
        }, this._resetIsScrollingDebounced);
    }
    scrollToItem(index, align = 'auto', enhanced = this.preset.enhanced) {
        const { itemCount } = this.props;
        const { scrollOffset } = this.state;
        index = Math.max(0, Math.min(index, itemCount - 1));
        this.scrollTo(this.itemList.getOffsetForIndexAndAlignment(index, align, scrollOffset), enhanced);
    }
    componentDidMount() {
        const { initialScrollOffset } = this.props;
        if (typeof initialScrollOffset === 'number' && this._outerRef != null) {
            const outerRef = this._outerRef;
            if (this.preset.isHorizontal) {
                outerRef.scrollLeft = initialScrollOffset;
            }
            else {
                outerRef.scrollTop = initialScrollOffset;
            }
        }
        this._callPropsCallbacks();
        this.preset.boundaryDetection();
    }
    componentDidUpdate(prevProps, prevState) {
        const { scrollOffset, scrollUpdateWasRequested } = this.state;
        this.preset.update(this.props);
        if (scrollUpdateWasRequested && this._outerRef != null) {
            const outerRef = this._outerRef;
            if (this.preset.isHorizontal) {
                if (this.preset.isRtl) {
                    // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
                    // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
                    // So we need to determine which browser behavior we're dealing with, and mimic it.
                    switch (getRTLOffsetType()) {
                        case 'negative':
                            outerRef.scrollLeft = -scrollOffset;
                            break;
                        case 'positive-ascending':
                            outerRef.scrollLeft = scrollOffset;
                            break;
                        default:
                            outerRef.scrollLeft = outerRef.scrollWidth - outerRef.clientWidth - scrollOffset;
                            break;
                    }
                }
                else {
                    outerRef.scrollLeft = scrollOffset;
                }
            }
            else {
                outerRef.scrollTop = scrollOffset;
            }
        }
        this._callPropsCallbacks(prevProps, prevState);
    }
    componentWillUnmount() {
        if (this._resetIsScrollingTimeoutId !== null) {
            cancelTimeout(this._resetIsScrollingTimeoutId);
        }
        this.preset.dispose();
    }
    getRenderItemNode(index, type = 'node') {
        const { item, itemData, itemKey = defaultItemKey, useIsScrolling } = this.props;
        const { isScrolling } = this.state;
        const key = itemKey(index, itemData);
        const style = this.preset.getItemStyle(index);
        if (type === 'placeholder') {
            return React.createElement(this.preset.itemElement, {
                key,
                id: `${this.preset.id}-${index}-wrapper`,
                style: this.preset.isBrick ? style : { display: 'none' }
            });
        }
        return React.createElement(this.preset.itemElement, {
            key: itemKey(index, itemData),
            id: `${this.preset.id}-${index}-wrapper`,
            style
        }, React.createElement(item, {
            id: `${this.preset.id}-${index}`,
            data: itemData,
            index,
            isScrolling: useIsScrolling ? isScrolling : undefined
        }));
    }
    getRenderColumnNode() {
        const { isScrolling } = this.state;
        const { innerRef, itemCount } = this.props;
        const isHorizontal = this.preset.isHorizontal;
        // Read this value AFTER items have been created,
        // So their actual sizes (if variable) are taken into consideration.
        const estimatedTotalSize = convertNumber2PX(this.itemList.getOffsetSize());
        const columnProps = {
            ref: innerRef,
            key: `${this.preset.id}-inner`,
            id: `${this.preset.id}-inner`,
            style: {
                height: isHorizontal ? '100%' : estimatedTotalSize,
                width: !isHorizontal ? '100%' : estimatedTotalSize,
                position: 'relative',
                pointerEvents: isScrolling ? 'none' : 'auto',
            }
        };
        const [startIndex, stopIndex] = this._getRangeToRender();
        const items = [];
        if (this.preset.isRelative && !this.preset.isBrick) {
            const pre = convertNumber2PX(this.itemList.getOffsetSizeCache(startIndex));
            items.push(React.createElement(this.preset.itemElement, {
                key: `${this.preset.id}-pre`,
                id: `${this.preset.id}-pre`,
                style: {
                    height: isHorizontal ? '100%' : pre,
                    width: !isHorizontal ? '100%' : pre
                }
            }));
        }
        const placeholderCount = this.preset.placeholderCount;
        const restCount = itemCount - stopIndex;
        const prevPlaceholder = startIndex < placeholderCount ? startIndex : placeholderCount;
        const postPlaceholder = restCount < placeholderCount ? restCount : placeholderCount;
        for (let itemIndex = 0; itemIndex < stopIndex + postPlaceholder; itemIndex++) {
            if (!this.preset.isBrick) {
                if (itemIndex < startIndex - prevPlaceholder) {
                    itemIndex = startIndex - prevPlaceholder;
                    continue;
                }
            }
            if (itemIndex < startIndex || itemIndex > stopIndex) {
                items.push(this.getRenderItemNode(itemIndex, 'placeholder'));
            }
            else {
                items.push(this.getRenderItemNode(itemIndex));
            }
        }
        return React.createElement(this.preset.innerElement, columnProps, items);
    }
    render() {
        const _a = omit(this.props, [
            'item', 'itemCount', 'itemData', 'itemKey', 'useIsScrolling',
            'innerElementType', 'innerTagName', 'itemElementType', 'itemTagName',
            'outerElementType', 'outerTagName', 'onScrollToLower', 'onScrollToUpper',
            'upperThreshold', 'lowerThreshold',
            'position', 'innerRef',
        ]), { className, direction, height, layout, style, width, enhanced = false, outerWrapper, renderTop, renderBottom } = _a, rest = __rest(_a, ["className", "direction", "height", "layout", "style", "width", "enhanced", "outerWrapper", "renderTop", "renderBottom"]);
        const { scrollOffset, scrollUpdateWasRequested } = this.state;
        const isHorizontal = this.preset.isHorizontal;
        const outerProps = Object.assign(Object.assign({}, rest), { id: this.preset.id, className, onScroll: isHorizontal ? this._onScrollHorizontal : this._onScrollVertical, ref: this._outerRefSetter, layout,
            enhanced, style: Object.assign({ position: 'relative', height: convertNumber2PX(height), width: convertNumber2PX(width), overflow: 'auto', WebkitOverflowScrolling: 'touch', willChange: 'transform', direction }, style), outerElementType: this.preset.outerElement, innerElementType: this.preset.innerElement, renderTop,
            renderBottom });
        if (!enhanced) {
            if (isHorizontal) {
                outerProps.scrollLeft = scrollUpdateWasRequested ? scrollOffset : this.preset.field.scrollLeft;
            }
            else {
                outerProps.scrollTop = scrollUpdateWasRequested ? scrollOffset : this.preset.field.scrollTop;
            }
        }
        return React.createElement(outerWrapper || this.preset.outerElement, outerProps, this.getRenderColumnNode());
    }
}
List.defaultProps = {
    direction: 'ltr',
    itemData: undefined,
    layout: 'vertical',
    overscanCount: 2,
    useIsScrolling: false,
    shouldResetStyleCacheOnItemSizeChange: true
};
// NOTE: I considered further wrapping individual items with a pure ListItem component.
// This would avoid ever calling the render function for the same index more than once,
// But it would also add the overhead of a lot of components/fibers.
// I assume people already do this (render function returning a class component),
// So my doing it would just unnecessarily double the wrappers.

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return List; } });
//# sourceMappingURL=list.js.map

}, function(modId) { var map = {"../../../utils/index.js":1768876401574,"../constants.js":1768876401582,"../dom-helpers.js":1768876401583,"../preset.js":1768876401584,"./validate.js":1768876401589,"../../../utils/dom.js":1768876401576,"../../../utils/timer.js":1768876401580,"../../../utils/helper.js":1768876401577,"../../../utils/convert.js":1768876401575,"../../../utils/lodash.js":1768876401578}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401589, function(require, module, exports) {
let devWarningsDirection = null;
let devWarningsTagName = null;
if (process.env.NODE_ENV !== 'production') {
    if (typeof window !== 'undefined' && typeof window.WeakSet !== 'undefined') {
        devWarningsDirection = /* #__PURE__ */ new WeakSet();
        devWarningsTagName = /* #__PURE__ */ new WeakSet();
    }
}
const validateListProps = ({ item, direction, layout, itemTagName, innerTagName, outerTagName, itemSize }, { instance, }) => {
    if (process.env.NODE_ENV !== 'production') {
        if (!['number', 'function'].includes(typeof itemSize)) {
            throw Error('An invalid "itemSize" prop has been specified. ' + 'Value should be a number or function. ' + `"${itemSize === null ? 'null' : typeof itemSize}" was specified.`);
        }
    }
    if (process.env.NODE_ENV !== 'production') {
        if (innerTagName != null || outerTagName != null || itemTagName != null) {
            if (devWarningsTagName && !devWarningsTagName.has(instance)) {
                devWarningsTagName.add(instance);
                console.warn('The itemTagName、innerTagName and outerTagName props have been deprecated. ' + 'Please use the itemElementType、innerElementType and outerElementType props instead.');
            }
        }
        switch (direction) {
            case 'horizontal':
            case 'vertical':
                if (devWarningsDirection && !devWarningsDirection.has(instance)) {
                    devWarningsDirection.add(instance);
                    console.warn('The direction prop should be either "ltr" (default) or "rtl". ' + 'Please use the layout prop to specify "vertical" (default) or "horizontal" orientation.');
                }
                break;
            case 'ltr':
            case 'rtl':
                // Valid values
                break;
            default:
                throw Error('An invalid "direction" prop has been specified. ' + 'Value should be either "ltr" or "rtl". ' + `"${direction}" was specified.`);
        }
        switch (layout) {
            case 'horizontal':
            case 'vertical':
                // Valid values
                break;
            default:
                throw Error('An invalid "layout" prop has been specified. ' + 'Value should be either "horizontal" or "vertical". ' + `"${layout}" was specified.`);
        }
        if (item == null) {
            throw Error('An invalid "item" prop has been specified. ' + 'Value should be a React component. ' + `"${item === null ? 'null' : typeof item}" was specified.`);
        }
        // if (isHorizontal && typeof width !== 'number') {
        //   throw Error('An invalid "width" prop has been specified. ' + 'Horizontal lists must specify a number for width. ' + `"${width === null ? 'null' : typeof width}" was specified.`)
        // } else if (!isHorizontal && typeof height !== 'number') {
        //   throw Error('An invalid "height" prop has been specified. ' + 'Vertical lists must specify a number for height. ' + `"${height === null ? 'null' : typeof height}" was specified.`)
        // }
    }
    return null;
};

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'validateListProps', { enumerable: true, configurable: true, get: function() { return validateListProps; } });
//# sourceMappingURL=validate.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401590, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('react');var React = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/index.js');
var __TEMP__ = require('../../../utils/convert.js');var convertPX2Int = __TEMP__['convertPX2Int'];

function getRenderExpandNodes({ direction, isHorizontal, isRtl, id: sid, innerElement, renderExpand, }) {
    const id = `${sid}-${direction}`;
    const props = {
        key: id,
        id,
        style: {
            visibility: 'hidden',
            height: isHorizontal ? '100%' : 100,
            width: isHorizontal ? 100 : '100%',
            [isHorizontal ? isRtl ? 'marginRight' : 'marginLeft' : 'marginTop']: -100,
            zIndex: -1,
        }
    };
    const expands = [renderExpand, React.createElement(innerElement, props)];
    if (isHorizontal ? isRtl ? direction === 'right' : direction === 'left' : direction === 'top') {
        expands.reverse();
    }
    return expands;
}
const outerWrapper = React.forwardRef(function OuterWrapper(props, ref) {
    const _a = props, { id = '', className, style = {}, children, outerElementType, innerElementType, onScroll, onScrollNative, renderTop, renderBottom, layout, direction } = _a, rest = __rest(_a, ["id", "className", "style", "children", "outerElementType", "innerElementType", "onScroll", "onScrollNative", "renderTop", "renderBottom", "layout", "direction"]);
    const handleScroll = (event) => {
        onScroll === null || onScroll === void 0 ? void 0 : onScroll(Object.assign(Object.assign({}, event), { currentTarget: Object.assign(Object.assign({}, event.detail), { clientWidth: convertPX2Int(style.width), clientHeight: convertPX2Int(style.height) }) }));
        if (typeof onScrollNative === 'function') {
            onScrollNative(event);
        }
    };
    const isHorizontal = layout === 'horizontal';
    const isRtl = direction === 'rtl';
    return React.createElement(outerElementType, Object.assign({ ref,
        id,
        className,
        style, scrollY: !isHorizontal, scrollX: isHorizontal, onScroll: handleScroll }, rest), [
        getRenderExpandNodes({
            direction: isHorizontal ? isRtl ? 'right' : 'left' : 'top',
            isHorizontal,
            isRtl,
            id,
            innerElement: innerElementType,
            renderExpand: renderTop,
        }),
        children,
        getRenderExpandNodes({
            direction: isHorizontal ? isRtl ? 'left' : 'right' : 'bottom',
            isHorizontal,
            isRtl,
            id,
            innerElement: innerElementType,
            renderExpand: renderBottom,
        }),
    ]);
});

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return outerWrapper; } });
//# sourceMappingURL=wrapper.js.map

}, function(modId) { var map = {"../../../utils/index.js":1768876401574,"../../../utils/convert.js":1768876401575}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401591, function(require, module, exports) {
const VirtualWaterfall = (process.env.FRAMEWORK === 'vue' || process.env.FRAMEWORK === 'vue3')
    ? require('./vue').default
    : require('./react').default;

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'VirtualWaterfall', { enumerable: true, configurable: true, get: function() { return VirtualWaterfall; } });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return VirtualWaterfall; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./vue":1768876401592,"./react":1768876401597}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401592, function(require, module, exports) {
var __TEMP__ = require('./waterfall.js');var Waterfall = __REQUIRE_DEFAULT__(__TEMP__);

const VirtualWaterfall = Waterfall;
function install(Vue) {
    Vue.component('virtual-waterfall', Waterfall);
}
var index = {
    install
};

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'VirtualWaterfall', { enumerable: true, configurable: true, get: function() { return VirtualWaterfall; } });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return index; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./waterfall.js":1768876401593}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401593, function(require, module, exports) {
var __TEMP__ = require('@tarojs/shared');var isNumber = __TEMP__['isNumber'];
var __TEMP__ = require('classnames');var classNames = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('vue');var defineComponent = __TEMP__['defineComponent'];
var __TEMP__ = require('../../../utils/index.js');
var __TEMP__ = require('../../../utils/vue-render.js');var render = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../constants.js');var IS_SCROLLING_DEBOUNCE_INTERVAL = __TEMP__['IS_SCROLLING_DEBOUNCE_INTERVAL'];
var __TEMP__ = require('../preset.js');var Preset = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/dom.js');var getScrollViewContextNode = __TEMP__['getScrollViewContextNode'];var getRectSizeSync = __TEMP__['getRectSizeSync'];
var __TEMP__ = require('../../../utils/timer.js');var cancelTimeout = __TEMP__['cancelTimeout'];var requestTimeout = __TEMP__['requestTimeout'];
var __TEMP__ = require('../../../utils/helper.js');var defaultItemKey = __TEMP__['defaultItemKey'];
var __TEMP__ = require('../../../utils/convert.js');var convertNumber2PX = __TEMP__['convertNumber2PX'];
var __TEMP__ = require('../../../utils/lodash.js');var omit = __TEMP__['omit'];

var Waterfall = defineComponent({
    props: {
        id: String,
        height: {
            type: [String, Number],
            required: true
        },
        width: {
            type: [String, Number],
            required: true
        },
        column: Number,
        columnWidth: Number,
        item: {
            required: true
        },
        itemCount: {
            type: Number,
            required: true
        },
        itemData: {
            type: Array,
            required: true
        },
        itemKey: Function,
        itemSize: {
            type: [Number, Function],
            required: true
        },
        unlimitedSize: {
            type: Boolean,
            default: false
        },
        queryPrefix: {
            type: String,
            default: ''
        },
        position: {
            type: String,
            default: 'absolute'
        },
        initialScrollOffset: {
            type: Number,
            default: 0
        },
        overscanDistance: {
            type: Number,
            default: 50
        },
        placeholderCount: {
            type: Number,
            default: 0
        },
        useIsScrolling: {
            type: Boolean,
            default: false
        },
        enhanced: {
            type: Boolean,
            default: true
        },
        shouldResetStyleCacheOnItemSizeChange: {
            type: Boolean,
            default: true
        },
        outerElementType: {
            type: String,
            default: process.env.TARO_PLATFORM === 'web' ? 'taro-scroll-view-core' : 'scroll-view'
        },
        innerElementType: {
            type: String,
            default: process.env.TARO_PLATFORM === 'web' ? 'taro-view-core' : 'view'
        },
        itemElementType: {
            type: String,
            default: process.env.TARO_PLATFORM === 'web' ? 'taro-view-core' : 'view'
        },
        outerTagName: String,
        innerTagName: String,
        itemTagName: String,
        outerRef: String,
        onScrollNative: Function,
        onItemsRendered: Function,
    },
    data() {
        const preset = new Preset(this.$props, this.refresh);
        const id = this.$props.id || preset.id;
        preset.updateWrapper(id);
        return {
            itemMap: preset.itemMap,
            preset,
            instance: this,
            isScrolling: false,
            scrollDirection: 'forward',
            scrollOffset: typeof this.$props.initialScrollOffset === 'number'
                ? this.$props.initialScrollOffset
                : 0,
            scrollUpdateWasRequested: false,
            resetIsScrollingTimeoutId: null,
            refreshCount: 0
        };
    },
    methods: {
        refresh() {
            this.refreshCount = this.refreshCount + 1;
        },
        scrollTo(scrollOffset = 0, enhanced = this.preset.enhanced) {
            scrollOffset = Math.max(0, scrollOffset);
            if (this.scrollOffset === scrollOffset)
                return;
            if (enhanced) {
                const option = {
                    animated: true,
                    duration: 300,
                };
                option.top = scrollOffset;
                return getScrollViewContextNode(`${this.$props.queryPrefix}#${this.preset.id}`).then((node) => node.scrollTo(option));
            }
            this.scrollDirection = this.scrollOffset < scrollOffset ? 'forward' : 'backward';
            this.scrollOffset = scrollOffset;
            this.scrollUpdateWasRequested = true;
            this.$nextTick(this._resetIsScrollingDebounced);
        },
        scrollToItem(index, align = 'auto', enhanced = this.preset.enhanced) {
            const { itemCount } = this.$props;
            const { scrollOffset } = this.$data;
            index = Math.max(0, Math.min(index, itemCount - 1));
            this.scrollTo(this.itemMap.getOffsetForIndexAndAlignment(index, align, scrollOffset), enhanced);
        },
        _callOnItemsRendered: memoizeOne(function (overscanStartIndex, overscanStopIndex, startIndex, stopIndex) {
            return this.$props.onItemsRendered({
                overscanStartIndex,
                overscanStopIndex,
                startIndex,
                stopIndex
            });
        }),
        _callOnScroll: memoizeOne(function (scrollDirection, scrollOffset, scrollUpdateWasRequested, detail) {
            this.$emit('scroll', {
                scrollDirection,
                scrollOffset,
                scrollUpdateWasRequested,
                detail
            });
        }),
        _callPropsCallbacks() {
            if (typeof this.$props.onItemsRendered === 'function') {
                if (this.$props.itemCount > 0) {
                    for (let columnIndex = 0; columnIndex < this.itemMap.columns; columnIndex++) {
                        const [overscanStartIndex, overscanStopIndex] = this._getRangeToRender(columnIndex);
                        this._callOnItemsRendered(columnIndex, overscanStartIndex, overscanStopIndex);
                    }
                }
            }
            if (typeof this.$props.onScroll === 'function') {
                this._callOnScroll(this.scrollDirection, this.scrollOffset, this.scrollUpdateWasRequested, this.preset.field);
            }
            if (this.itemMap.isUnlimitedMode) {
                setTimeout(() => {
                    for (let column = 0; column < this.itemMap.columns; column++) {
                        const [startIndex, stopIndex] = this._getRangeToRender(column);
                        for (let row = startIndex; row <= stopIndex; row++) {
                            const itemIndex = this.itemMap.getItemIndexByPosition(column, row);
                            if (itemIndex >= 0 && itemIndex < this.$props.itemCount) {
                                const times = this.itemMap.compareSizeByPosition(column, row) ? 3 : 0;
                                getRectSizeSync(`${this.$props.queryPrefix}#${this.preset.id}-${itemIndex}`, 100, times).then(({ height }) => {
                                    if (typeof height === 'number' && height > 0 && !this.itemMap.compareSizeByPosition(column, row, height)) {
                                        this.itemMap.setSizeByPosition(column, row, height);
                                    }
                                });
                            }
                        }
                    }
                }, 0);
            }
        },
        _getRangeToRender(columnIndex = 0) {
            return this.itemMap.getRangeToRender(this.$data.scrollDirection, columnIndex, this.$data.scrollOffset, this.$data.isScrolling);
        },
        _outerRefSetter(ref) {
            const { outerRef } = this.$props;
            this._outerRef = ref;
            if (typeof outerRef === 'function') {
                outerRef(ref);
            }
            else if (outerRef != null && typeof outerRef === 'object' && outerRef.hasOwnProperty('value')) {
                outerRef.value = ref;
            }
        },
        _resetIsScrollingDebounced() {
            if (this.resetIsScrollingTimeoutId !== null) {
                cancelTimeout(this.resetIsScrollingTimeoutId);
            }
            this.resetIsScrollingTimeoutId = requestTimeout(this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL);
        },
        _resetIsScrolling() {
            this.resetIsScrollingTimeoutId = null;
            this.isScrolling = false;
            this.$nextTick(() => {
                this.preset.resetCache();
            });
        },
        _onScroll(event) {
            const { scrollHeight = this.itemMap.maxColumnSize, scrollWidth, scrollTop, scrollLeft, } = event.currentTarget;
            if (!isNumber(scrollHeight) || !isNumber(scrollWidth))
                return;
            const clientHeight = this.itemMap.wrapperHeight;
            const clientWidth = this.itemMap.wrapperWidth;
            if (this.$props.onScrollNative) {
                this.$props.onScrollNative(event);
            }
            const diffOffset = this.preset.field.scrollTop - scrollTop;
            if (this.scrollOffset === scrollTop || this.preset.isShaking(diffOffset)) {
                return;
            }
            // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
            const scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
            this.preset.field = {
                scrollHeight: this.itemMap.maxColumnSize,
                scrollWidth,
                scrollTop: scrollOffset,
                scrollLeft,
                clientHeight,
                clientWidth,
                diffOffset: this.preset.field.scrollTop - scrollOffset,
            };
            this.isScrolling = true;
            this.scrollDirection = this.scrollOffset < scrollOffset ? 'forward' : 'backward';
            this.scrollOffset = scrollOffset;
            this.scrollUpdateWasRequested = false;
            this.$nextTick(this._resetIsScrollingDebounced);
        },
        getRenderItemNode(itemIndex, type = 'node') {
            const { item, itemData, itemKey = defaultItemKey, useIsScrolling } = this.$props;
            const { isScrolling } = this.$data;
            const key = itemKey(itemIndex, itemData);
            const style = this.preset.getItemStyle(itemIndex);
            if (type === 'placeholder') {
                return render(this.preset.itemElement, {
                    key,
                    id: `${this.preset.id}-${itemIndex}-wrapper`,
                    style: this.preset.isBrick ? style : { display: 'none' }
                });
            }
            return render(this.preset.itemElement, {
                key,
                id: `${this.preset.id}-${itemIndex}-wrapper`,
                style
            }, render(item, {
                id: `${this.preset.id}-${itemIndex}`,
                data: itemData,
                index: itemIndex,
                isScrolling: useIsScrolling ? isScrolling : undefined
            }));
        },
        getRenderColumnNode(columnIndex) {
            const columnProps = {
                key: `${this.preset.id}-column-${columnIndex}`,
                id: `${this.preset.id}-column-${columnIndex}`,
                style: {
                    height: '100%',
                    position: 'relative',
                    width: convertNumber2PX(this.itemMap.columnWidth)
                }
            };
            const [startIndex, stopIndex] = this._getRangeToRender(columnIndex);
            const items = [];
            if (this.preset.isRelative && !this.preset.isBrick) {
                const pre = convertNumber2PX(this.itemMap.getOffsetSizeCache(columnIndex, startIndex));
                items.push(render(this.preset.itemElement, {
                    key: `${this.preset.id}-${columnIndex}-pre`,
                    id: `${this.preset.id}-${columnIndex}-pre`,
                    style: {
                        height: pre,
                        width: '100%'
                    }
                }));
            }
            const placeholderCount = this.preset.placeholderCount;
            const restCount = this.itemMap.getColumnLength(columnIndex) - stopIndex;
            const prevPlaceholder = startIndex < placeholderCount ? startIndex : placeholderCount;
            const postPlaceholder = restCount < placeholderCount ? restCount : placeholderCount;
            const visibleItem = (stopIndex + postPlaceholder) * this.itemMap.columns + columnIndex;
            this.itemMap.updateItem(visibleItem);
            for (let row = 0; row < stopIndex + postPlaceholder; row++) {
                const itemIndex = this.itemMap.getItemIndexByPosition(columnIndex, row);
                if (itemIndex >= 0 && itemIndex < this.$props.itemCount) {
                    if (!this.preset.isBrick) {
                        if (row < startIndex - prevPlaceholder) {
                            row = startIndex - prevPlaceholder;
                            continue;
                        }
                    }
                    if (row < startIndex || row > stopIndex) {
                        items.push(this.getRenderItemNode(itemIndex, 'placeholder'));
                    }
                    else {
                        items.push(this.getRenderItemNode(itemIndex));
                    }
                }
            }
            return render(this.preset.innerElement, columnProps, items);
        },
        getRenderExpandNodes(direction) {
            const props = {
                id: `${this.preset.id}-${direction}`,
                style: {
                    visibility: 'hidden',
                    height: 100,
                    width: '100%',
                    marginTop: -100,
                    zIndex: -1,
                }
            };
            return render(this.preset.innerElement, props);
        }
    },
    mounted() {
        const { initialScrollOffset } = this.$props;
        if (typeof initialScrollOffset === 'number' && this._outerRef != null) {
            const outerRef = this._outerRef;
            outerRef.scrollTop = initialScrollOffset;
        }
        this._callPropsCallbacks();
        this.preset.boundaryDetection();
    },
    updated() {
        const { scrollOffset, scrollUpdateWasRequested } = this.$data;
        this.preset.update(this.$props);
        if (scrollUpdateWasRequested && this._outerRef != null) {
            this._outerRef.scrollTop = scrollOffset;
        }
        this._callPropsCallbacks();
    },
    beforeDestroy() {
        if (this.resetIsScrollingTimeoutId !== null) {
            cancelTimeout(this.resetIsScrollingTimeoutId);
        }
        this.preset.dispose();
    },
    render() {
        var _a, _b, _c, _d;
        const { height, width, enhanced = false } = omit(this.$props, [
            'item', 'itemCount', 'itemData', 'itemKey', 'useIsScrolling',
            'innerElementType', 'innerTagName', 'itemElementType', 'itemTagName',
            'outerElementType', 'outerTagName', 'onScrollToLower', 'onScrollToUpper',
            'upperThreshold', 'lowerThreshold',
            'position'
        ]);
        const { isScrolling, scrollOffset, scrollUpdateWasRequested } = this.$data;
        const estimatedHeight = convertNumber2PX(this.itemMap.maxColumnSize);
        const outerElementProps = {
            id: this.preset.id,
            ref: this._outerRefSetter,
            enhanced,
            class: classNames(this.$attrs.class, 'virtual-waterfall'),
            style: {
                height: convertNumber2PX(height),
                width: convertNumber2PX(width),
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                willChange: 'transform',
            },
            attrs: {
                scrollY: true,
            },
            on: {
                scroll: this._onScroll
            },
        };
        if (!enhanced) {
            outerElementProps.scrollTop = scrollUpdateWasRequested ? scrollOffset : this.preset.field.scrollTop;
        }
        const columnNodes = [];
        for (let i = 0; i < this.itemMap.columns; i++) {
            columnNodes.push(this.getRenderColumnNode(i));
        }
        return render(this.preset.outerElement, outerElementProps, [
            this.getRenderExpandNodes('top'),
            process.env.FRAMEWORK === 'vue3' ? (_b = (_a = this.$slots).top) === null || _b === void 0 ? void 0 : _b.call(_a) : this.$slots.top,
            render(this.preset.innerElement, {
                key: `${this.preset.id}-wrapper`,
                id: `${this.preset.id}-wrapper`,
                class: classNames(this.$attrs.class, 'virtual-waterfall-wrapper'),
                style: {
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    pointerEvents: isScrolling ? 'none' : 'auto',
                    position: 'relative',
                    height: estimatedHeight,
                    width: '100%',
                },
            }, columnNodes),
            process.env.FRAMEWORK === 'vue3' ? (_d = (_c = this.$slots).bottom) === null || _d === void 0 ? void 0 : _d.call(_c) : this.$slots.bottom,
            this.getRenderExpandNodes('bottom'),
        ]);
    }
});

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return Waterfall; } });
//# sourceMappingURL=waterfall.js.map

}, function(modId) { var map = {"../../../utils/index.js":1768876401574,"../../../utils/vue-render.js":1768876401581,"../constants.js":1768876401594,"../preset.js":1768876401595,"../../../utils/dom.js":1768876401576,"../../../utils/timer.js":1768876401580,"../../../utils/helper.js":1768876401577,"../../../utils/convert.js":1768876401575,"../../../utils/lodash.js":1768876401578}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401594, function(require, module, exports) {
const IS_SCROLLING_DEBOUNCE_INTERVAL = 200;

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'IS_SCROLLING_DEBOUNCE_INTERVAL', { enumerable: true, configurable: true, get: function() { return IS_SCROLLING_DEBOUNCE_INTERVAL; } });
//# sourceMappingURL=constants.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401595, function(require, module, exports) {
var __TEMP__ = require('@tarojs/taro');var createSelectorQuery = __TEMP__['createSelectorQuery'];var getCurrentInstance = __TEMP__['getCurrentInstance'];var createIntersectionObserver = __TEMP__['createIntersectionObserver'];
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../utils/index.js');
var __TEMP__ = require('./list-map.js');var ListMap = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../utils/convert.js');var convertNumber2PX = __TEMP__['convertNumber2PX'];
var __TEMP__ = require('../../utils/dom.js');var getRectSizeSync = __TEMP__['getRectSizeSync'];
var __TEMP__ = require('../../utils/math.js');var isCosDistributing = __TEMP__['isCosDistributing'];
var __TEMP__ = require('../../utils/lodash.js');var throttle = __TEMP__['throttle'];

let INSTANCE_ID = 0;
class Preset {
    constructor(props, refresh) {
        this.props = props;
        this.refresh = refresh;
        this._observer = {};
        this._wrapperField = {
            scrollLeft: 0,
            scrollTop: 0,
            scrollHeight: 0,
            scrollWidth: 0,
            clientHeight: 0,
            clientWidth: 0,
            diffOffset: 0
        };
        this.diffList = [0, 0, 0];
        this.getItemStyleCache = memoizeOne((itemIndex, itemSize, _flag = this.itemMap.refreshCounter) => {
            itemSize = itemSize || this.itemMap.getSize(itemIndex);
            const style = this.isRelative ? {} : {
                position: 'absolute',
                left: 0,
            };
            style.width = '100%';
            style.height = convertNumber2PX(itemSize);
            if (!this.isRelative) {
                const nodeOffset = this.itemMap.getOffsetSize(itemIndex);
                style.top = convertNumber2PX(nodeOffset);
            }
            return style;
        });
        this.init(this.props);
        this.itemMap = new ListMap(props, refresh);
    }
    init(props) {
        this.props = props;
    }
    update(props) {
        this.props = props;
        this.itemMap.update(props);
    }
    async updateWrapper(id) {
        var _a;
        var _b, _c;
        this.id = id;
        const { width = 0, height = 0 } = this.props;
        const validWidth = typeof width === 'number' && width > 0;
        const validHeight = typeof height === 'number' && height > 0;
        if (validWidth) {
            this.itemMap.wrapperWidth = width;
        }
        if (validHeight) {
            this.itemMap.wrapperHeight = height;
        }
        if (!validHeight || !validWidth) {
            const res = await getRectSizeSync(`#${id}`, 100);
            (_b = this.itemMap).wrapperWidth || (_b.wrapperWidth = res.width);
            (_c = this.itemMap).wrapperHeight || (_c.wrapperHeight = res.height);
            (_a = this.refresh) === null || _a === void 0 ? void 0 : _a.call(this);
        }
        this.itemMap.update(this.props);
    }
    set id(id) {
        this._id = id;
    }
    get id() {
        this._id || (this._id = `virtual-waterfall-${INSTANCE_ID++}`);
        return this._id;
    }
    get isRelative() {
        return this.props.position && this.props.position !== 'absolute';
    }
    get isBrick() {
        return this.props.position === 'brick';
    }
    get placeholderCount() {
        return this.props.placeholderCount || 0;
    }
    get outerElement() {
        return this.props.outerElementType || this.props.outerTagName || 'div';
    }
    get innerElement() {
        return this.props.innerElementType || this.props.innerTagName || 'div';
    }
    get itemElement() {
        return this.props.itemElementType || this.props.itemTagName || 'div';
    }
    get field() {
        return this._wrapperField;
    }
    set field(o) {
        Object.assign(this._wrapperField, o);
    }
    get enhanced() {
        return this.props.enhanced || true;
    }
    isShaking(diff) {
        if (process.env.TARO_PLATFORM === 'web' || this.props.enhanced)
            return false;
        const list = this.diffList.slice(-3);
        this.diffList.push(diff);
        return list.findIndex(e => Math.abs(e) === Math.abs(diff)) !== -1 || isCosDistributing(this.diffList.slice(-4));
    }
    resetCache() {
        this.itemMap.refreshCounter++;
    }
    getItemStyle(itemIndex) {
        const { shouldResetStyleCacheOnItemSizeChange } = this.props;
        return this.getItemStyleCache(itemIndex, shouldResetStyleCacheOnItemSizeChange ? this.itemMap.getSize(itemIndex) : false);
    }
    boundaryDetection() {
        if ([typeof this.props.onScrollToUpper, typeof this.props.onScrollToLower].every(e => e !== 'function'))
            return;
        createSelectorQuery().select(`#${this.id}`).node().exec(() => {
            const upperObserver = this.boundaryDetectionHelper({
                event: typeof this.props.onScrollToUpper === 'function' ? () => {
                    if (this.field.diffOffset >= 0)
                        this.props.onScrollToUpper();
                } : undefined,
                id: `${this.id}-top`,
            });
            if (upperObserver) {
                this._observer.top = upperObserver;
            }
            const lowerObserver = this.boundaryDetectionHelper({
                event: typeof this.props.onScrollToLower === 'function' ? () => {
                    if (this.field.diffOffset <= 0)
                        this.props.onScrollToLower();
                } : undefined,
                id: `${this.id}-bottom`,
            });
            if (lowerObserver) {
                this._observer.bottom = lowerObserver;
            }
        });
    }
    boundaryDetectionHelper({ component, event, id, }) {
        if (typeof event !== 'function')
            return;
        const eventFunc = throttle(event);
        component || (component = getCurrentInstance().page);
        const observer = createIntersectionObserver(component, {
            thresholds: [0.4],
        });
        observer
            .relativeTo(`#${this.id}`, {
            top: typeof this.props.lowerThreshold === 'number' ? this.props.lowerThreshold : 50,
            bottom: typeof this.props.upperThreshold === 'number' ? this.props.upperThreshold : 50,
        })
            .observe(`#${id}`, eventFunc);
        return observer;
    }
    dispose() {
        Object.values(this._observer).forEach(e => { var _a; return (_a = e.disconnect) === null || _a === void 0 ? void 0 : _a.call(e); });
        this._observer = {};
    }
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return Preset; } });
//# sourceMappingURL=preset.js.map

}, function(modId) { var map = {"../../utils/index.js":1768876401574,"./list-map.js":1768876401596,"../../utils/convert.js":1768876401575,"../../utils/dom.js":1768876401576,"../../utils/math.js":1768876401579,"../../utils/lodash.js":1768876401578}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401596, function(require, module, exports) {
var __TEMP__ = require('@tarojs/shared');var isFunction = __TEMP__['isFunction'];var isNumber = __TEMP__['isNumber'];
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../utils/index.js');
var __TEMP__ = require('../../utils/helper.js');var getOffsetForIndexAndAlignment = __TEMP__['getOffsetForIndexAndAlignment'];

class ListMap {
    constructor(props, refresh) {
        this.props = props;
        this.refresh = refresh;
        this._columnMap = []; // [itemIndex, itemSize]
        this._items = []; // columnIndex-rowIndex
        this.minItemSize = 0;
        this.maxItemSize = 0;
        this.defaultSize = 1;
        this.wrapperHeight = 0;
        this.wrapperWidth = 0;
        this.columns = 2;
        this.columnWidth = 0;
        this.refreshCounter = 0;
        this.getOffsetSizeCache = memoizeOne((column, row, _flag = this.refreshCounter) => {
            return this.getOffsetSizeByPosition(column, row);
        });
        // Note: 不考虑列表模式切换情况，可能会导致列表抖动体验过差
        if (this.props.unlimitedSize) {
            this.mode = 'unlimited';
        }
        else if (isFunction(this.props.itemSize)) {
            this.mode = 'function';
        }
        else if (isNumber(this.props.itemSize)) {
            this.mode = 'normal';
        }
        this.defaultSize = (isFunction(this.props.itemSize) ? this.props.itemSize() : this.props.itemSize) || 1;
        this.minItemSize = this.defaultSize;
        this.maxItemSize = this.defaultSize;
        this.update(props);
    }
    get isNormalMode() {
        return this.mode === 'normal';
    }
    get isFunctionMode() {
        return this.mode === 'function';
    }
    get isUnlimitedMode() {
        return this.mode === 'unlimited';
    }
    get length() {
        return this.props.itemCount || 100;
    }
    get overscan() {
        return this.props.overscanDistance || 50;
    }
    get columnsSize() {
        if (this.isNormalMode) {
            return new Array(this._columns).fill(this.getColumnSize());
        }
        return new Array(this._columns).fill(0).map((_, i) => this.getColumnSize(i));
    }
    get maxColumnSize() {
        if (this.isNormalMode)
            return this.getColumnSize();
        return Math.max(...this.columnsSize);
    }
    get minColumnSize() {
        if (this.isNormalMode)
            return this.getColumnSize();
        return Math.min(...this.columnsSize);
    }
    get maxColumnIndex() {
        if (this.isNormalMode)
            return 0;
        const list = this.columnsSize;
        return list.indexOf(Math.max(...list));
    }
    get minColumnIndex() {
        if (this.isNormalMode)
            return 0;
        const list = this.columnsSize;
        return list.indexOf(Math.min(...list));
    }
    update(props) {
        this.props = props;
        const { column, columnWidth } = this.props;
        if (typeof column === 'number' && column > 0) {
            this.columns = column;
            this.columnWidth = this.wrapperWidth / column;
        }
        else if (typeof columnWidth === 'number' && columnWidth > 0) {
            this.columns = Math.floor(this.wrapperWidth / columnWidth);
            this.columnWidth = columnWidth;
        }
        else {
            this.columns = 2;
            this.columnWidth = this.wrapperWidth / this.columns;
        }
        this.columnWidth || (this.columnWidth = `calc(100% / ${this.columns})`);
        this.updateColumns(this.columns);
        // this.updateItem(this.length - 1)
    }
    updateColumns(columns = 2) {
        if (!this.isNormalMode && this._columns !== columns) {
            this._columnMap = new Array(columns).fill(0).map(() => []);
            this._items = [];
        }
        this._columns = columns;
    }
    updateItem(itemIndex) {
        if (this.isNormalMode)
            return;
        if (itemIndex >= this.length)
            return this.updateItem(this.length - 1);
        for (let i = 0; i <= itemIndex; i++) {
            const position = this.getItemPosition(i);
            if (position)
                continue;
            const column = this.minColumnIndex;
            const row = this.getColumnLength(column);
            this._items[i] = `${column}-${row}`;
            const itemSize = this.getSizeByPosition(column, row, i);
            if (!this.compareSizeByPosition(column, row, itemSize)) {
                this.setSizeByPosition(column, row, itemSize, i);
            }
        }
    }
    setSizeByPosition(column = 0, row = 0, itemSize = this.defaultSize, itemIndex = this.getItemIndexByPosition(column, row)) {
        var _a;
        if (itemIndex >= 0) {
            if (this.maxItemSize < itemSize || this.maxItemSize === 0) {
                this.maxItemSize = itemSize;
            }
            if (this.minItemSize > itemSize || this.minItemSize === 0) {
                this.minItemSize = itemSize;
            }
            this._columnMap[column][row] = [itemIndex, itemSize];
            if (!this.isNormalMode) {
                (_a = this.refresh) === null || _a === void 0 ? void 0 : _a.call(this);
                this.refreshCounter++;
            }
        }
    }
    getSize(itemIndex = 0) {
        const position = this.getItemPosition(itemIndex);
        if (position) {
            return this.getSizeByPosition(...position, itemIndex);
        }
        else {
            return this.defaultSize;
        }
    }
    getSizeByPosition(column = 0, row = 0, itemIndex = this.getItemIndexByPosition(column, row)) {
        var _a;
        if (this.isNormalMode)
            return this.defaultSize;
        let itemSize = (_a = this.getColumnList(column)[row]) === null || _a === void 0 ? void 0 : _a[1];
        if (typeof itemSize === 'number')
            return itemSize;
        itemSize = (isFunction(this.props.itemSize) ? this.props.itemSize(itemIndex, this.props.itemData) : this.props.itemSize) || this.defaultSize;
        this.setSizeByPosition(column, row, itemSize);
        return itemSize;
    }
    // 不支持 normal 模式
    getColumnList(column) {
        var _a;
        (_a = this._columnMap)[column] || (_a[column] = []);
        return this._columnMap[column];
    }
    getColumnLength(columnIndex) {
        if (this.isNormalMode)
            return Math.ceil(this.length / this._columns);
        return this.getColumnList(columnIndex).length;
    }
    getColumnSize(columnIndex = 0) {
        if (this.isNormalMode) {
            return this.defaultSize * this.getColumnLength(columnIndex);
        }
        // Note: 不考虑未同步节点情况
        return this.getOffsetSizeCache(columnIndex, this.getColumnLength(columnIndex));
    }
    getItemPosition(itemIndex) {
        var _a;
        if (this.isNormalMode) {
            const column = itemIndex % this._columns;
            const row = Math.floor(itemIndex / this._columns);
            return [column, row];
        }
        return ((_a = this._items[itemIndex]) === null || _a === void 0 ? void 0 : _a.split('-').map(Number)) || false;
    }
    getItemIndexByPosition(column = 0, row = 0) {
        if (this.isNormalMode) {
            return row * this._columns + column;
        }
        const columnList = this.getColumnList(column);
        const [itemIndex] = columnList[row] || [];
        return itemIndex;
    }
    getOffsetSize(itemIndex) {
        const [column, row] = this.getItemPosition(itemIndex) || [];
        return this.getOffsetSizeCache(column, row);
    }
    getOffsetSizeByPosition(column = 0, row = 0) {
        column = Math.max(0, column);
        row = Math.max(0, row);
        let sum = 0;
        for (let i = 0; i < row; i++) {
            sum += this.getSizeByPosition(column, i);
        }
        return sum;
    }
    getStartIndex(column, offset) {
        if (offset <= 0)
            return 0;
        if (this.isNormalMode) {
            const size = this.minItemSize || 1;
            return Math.max(0, Math.floor(offset / size));
        }
        const columnList = this.getColumnList(column);
        const columnLength = columnList.length - 1;
        let x = Math.floor(offset / (this.maxItemSize || 1));
        let y = Math.ceil(offset / (this.minItemSize || 1));
        this.updateItem(this.getItemIndexByPosition(column, y));
        x = Math.min(x, columnLength);
        y = Math.min(y, columnLength);
        while (this.getOffsetSizeCache(column, x - 1) < offset && this.getOffsetSizeCache(column, y - 1) > offset && x < y) {
            x < columnLength && x++;
            y > 0 && y--;
        }
        return Math.max(0, Math.min(this.getOffsetSizeCache(column, x - 1) > offset ? x : y, columnLength) - 1);
    }
    getStopIndex(column, offset, start = 0) {
        if (offset <= 0)
            return 0;
        if (this.isNormalMode) {
            const size = this.minItemSize || 1;
            const count = Math.ceil(offset / size);
            return Math.min(count, this.getColumnSize(column));
        }
        const columnList = this.getColumnList(column);
        const columnLength = columnList.length - 1;
        let x = Math.max(start, Math.floor(offset / (this.maxItemSize || 1)));
        let y = Math.max(start, Math.ceil(offset / (this.minItemSize || 1)));
        this.updateItem(this.getItemIndexByPosition(column, y));
        x = Math.min(x, columnLength);
        y = Math.min(y, columnLength);
        while (this.getOffsetSizeCache(column, x) < offset && this.getOffsetSizeCache(column, y) > offset && x < y) {
            x < columnLength && x++;
            y > 0 && y--;
        }
        return Math.max(1, Math.min(this.getOffsetSizeCache(column, x) > offset ? x : y, columnLength) + 1);
    }
    getRangeToRender(direction, column, offset, block = false) {
        if (this.length === 0)
            return [0, 0];
        const scrollSize = this.maxColumnSize;
        const backwardDistance = !block || direction === 'backward' ? Math.max(0, this.overscan) : 0;
        const forwardDistance = !block || direction === 'forward' ? Math.max(0, this.overscan) : 0;
        const overscanBackward = this.getStartIndex(column, Math.max(0, offset - this.wrapperHeight - backwardDistance));
        const overscanForward = this.getStopIndex(column, Math.max(0, Math.min(scrollSize, offset + this.wrapperHeight + forwardDistance)), overscanBackward);
        return [overscanBackward, overscanForward];
    }
    getOffsetForIndexAndAlignment(index, align, scrollOffset) {
        return getOffsetForIndexAndAlignment({
            align,
            containerSize: this.wrapperHeight,
            currentOffset: scrollOffset,
            scrollSize: this.getOffsetSize(this.length),
            slideSize: this.getColumnSize(index),
            targetOffset: this.getOffsetSize(index),
        });
    }
    compareSizeByPosition(column = 0, row = 0, size = this.getSizeByPosition(column, row)) {
        var _a, _b;
        if (this.isNormalMode)
            return true;
        const origenSize = (_b = (_a = this._columnMap[column]) === null || _a === void 0 ? void 0 : _a[row]) === null || _b === void 0 ? void 0 : _b[1];
        return typeof origenSize === 'number' && origenSize === size;
    }
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return ListMap; } });
//# sourceMappingURL=list-map.js.map

}, function(modId) { var map = {"../../utils/index.js":1768876401574,"../../utils/helper.js":1768876401577}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401597, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('@tarojs/components');var ScrollView = __TEMP__['ScrollView'];var View = __TEMP__['View'];
var __TEMP__ = require('react');var React = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./waterfall.js');var Waterfall = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./wrapper.js');var outerWrapper = __REQUIRE_DEFAULT__(__TEMP__);

const VirtualWaterfall = React.forwardRef(function VirtualWaterfall(props, ref) {
    const _a = props, { outerElementType = ScrollView, innerElementType = View, itemElementType = View, initialScrollOffset = 0, overscanDistance = 50, queryPrefix = '' } = _a, rest = __rest(_a, ["outerElementType", "innerElementType", "itemElementType", "initialScrollOffset", "overscanDistance", "queryPrefix"]);
    if ('children' in rest) {
        console.warn('Taro(VirtualWaterfall): children props have been deprecated. ' + 'Please use the item props instead.');
        rest.item = rest.children;
    }
    if (rest.item instanceof Array) {
        console.warn('Taro(VirtualWaterfall): item should not be an array');
        rest.item = rest.item[0];
    }
    return React.createElement(Waterfall, Object.assign(Object.assign({ ref }, rest), { outerElementType,
        itemElementType,
        innerElementType,
        initialScrollOffset,
        overscanDistance,
        outerWrapper,
        queryPrefix }));
});

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return VirtualWaterfall; } });
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./waterfall.js":1768876401598,"./wrapper.js":1768876401599}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401598, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('@tarojs/shared');var isNumber = __TEMP__['isNumber'];
var __TEMP__ = require('classnames');var classNames = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('memoize-one');var memoizeOne = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('react');var React = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/index.js');
var __TEMP__ = require('../constants.js');var IS_SCROLLING_DEBOUNCE_INTERVAL = __TEMP__['IS_SCROLLING_DEBOUNCE_INTERVAL'];
var __TEMP__ = require('../preset.js');var Preset = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/timer.js');var cancelTimeout = __TEMP__['cancelTimeout'];var requestTimeout = __TEMP__['requestTimeout'];
var __TEMP__ = require('../../../utils/dom.js');var getRectSizeSync = __TEMP__['getRectSizeSync'];var getScrollViewContextNode = __TEMP__['getScrollViewContextNode'];
var __TEMP__ = require('../../../utils/helper.js');var defaultItemKey = __TEMP__['defaultItemKey'];
var __TEMP__ = require('../../../utils/convert.js');var convertNumber2PX = __TEMP__['convertNumber2PX'];
var __TEMP__ = require('../../../utils/lodash.js');var omit = __TEMP__['omit'];

class Waterfall extends React.PureComponent {
    constructor(props) {
        super(props);
        this.refresh = () => {
            if (process.env.FRAMEWORK === 'preact') {
                this.forceUpdate();
            }
            else {
                this.setState(({ refreshCount }) => ({
                    refreshCount: ++refreshCount
                }));
            }
        };
        this._outerRef = undefined;
        this._resetIsScrollingTimeoutId = null;
        this._callOnItemsRendered = memoizeOne((columnIndex, overscanStartIndex, overscanStopIndex) => this.props.onItemsRendered({
            columnIndex,
            overscanStartIndex,
            overscanStopIndex,
        }));
        this._callOnScroll = memoizeOne((scrollDirection, scrollOffset, scrollUpdateWasRequested, detail) => this.props.onScroll({
            scrollDirection,
            scrollOffset,
            scrollUpdateWasRequested,
            detail
        }));
        this._outerRefSetter = ref => {
            const { outerRef } = this.props;
            this._outerRef = ref;
            if (typeof outerRef === 'function') {
                outerRef(ref);
            }
            else if (outerRef != null && typeof outerRef === 'object' && outerRef.hasOwnProperty('current')) {
                // @ts-ignore
                outerRef.current = ref;
            }
        };
        this._resetIsScrollingDebounced = () => {
            if (this._resetIsScrollingTimeoutId !== null) {
                cancelTimeout(this._resetIsScrollingTimeoutId);
            }
            this._resetIsScrollingTimeoutId = requestTimeout(this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL);
        };
        this._resetIsScrolling = () => {
            this._resetIsScrollingTimeoutId = null;
            this.setState({
                isScrolling: false
            }, () => {
                // Clear style cache after state update has been committed.
                // This way we don't break pure sCU for items that don't use isScrolling param.
                this.preset.resetCache();
            });
        };
        this._onScroll = event => {
            const { scrollHeight = this.itemMap.maxColumnSize, scrollWidth, scrollTop, scrollLeft } = event.currentTarget;
            if (!isNumber(scrollHeight) || !isNumber(scrollWidth))
                return;
            const clientHeight = this.itemMap.wrapperHeight;
            const clientWidth = this.itemMap.wrapperWidth;
            this.setState((prevState) => {
                const diffOffset = this.preset.field.scrollTop - scrollTop;
                if (prevState.scrollOffset === scrollTop || this.preset.isShaking(diffOffset)) {
                    // Scroll position may have been updated by cDM/cDU,
                    // In which case we don't need to trigger another render,
                    // And we don't want to update state.isScrolling.
                    return null;
                }
                // FIXME preact 中使用时，该组件会出现触底滚动事件重复触发导致的抖动问题，后续修复
                // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
                const scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
                this.preset.field = {
                    scrollHeight: this.itemMap.maxColumnSize,
                    scrollWidth,
                    scrollTop: scrollOffset,
                    scrollLeft,
                    clientHeight,
                    clientWidth,
                    diffOffset: this.preset.field.scrollTop - scrollOffset,
                };
                return {
                    isScrolling: true,
                    scrollDirection: prevState.scrollOffset < scrollOffset ? 'forward' : 'backward',
                    scrollOffset,
                    scrollUpdateWasRequested: false
                };
            }, this._resetIsScrollingDebounced);
        };
        this.preset = new Preset(props, this.refresh);
        const id = this.props.id || this.preset.id;
        this.preset.updateWrapper(id);
        this.itemMap = this.preset.itemMap;
        this.state = {
            instance: this,
            isScrolling: false,
            scrollDirection: 'forward',
            scrollOffset: typeof this.props.initialScrollOffset === 'number'
                ? this.props.initialScrollOffset
                : 0,
            scrollUpdateWasRequested: false,
            refreshCount: 0,
        };
    }
    _callPropsCallbacks(prevProps = {}, prevState = {}) {
        if (typeof this.props.onItemsRendered === 'function') {
            if (this.props.itemCount > 0) {
                if (prevProps && prevProps.itemCount !== this.props.itemCount) {
                    for (let columnIndex = 0; columnIndex < this.itemMap.columns; columnIndex++) {
                        const [overscanStartIndex, overscanStopIndex] = this._getRangeToRender(columnIndex);
                        this._callOnItemsRendered(columnIndex, overscanStartIndex, overscanStopIndex);
                    }
                }
            }
        }
        if (typeof this.props.onScroll === 'function') {
            if (!prevState ||
                prevState.scrollDirection !== this.state.scrollDirection ||
                prevState.scrollOffset !== this.state.scrollOffset ||
                prevState.scrollUpdateWasRequested !== this.state.scrollUpdateWasRequested) {
                this._callOnScroll(this.state.scrollDirection, this.state.scrollOffset, this.state.scrollUpdateWasRequested, this.preset.field);
            }
        }
        if (this.itemMap.isUnlimitedMode) {
            setTimeout(() => {
                for (let column = 0; column < this.itemMap.columns; column++) {
                    const [startIndex, stopIndex] = this._getRangeToRender(column);
                    for (let row = startIndex; row <= stopIndex; row++) {
                        const itemIndex = this.itemMap.getItemIndexByPosition(column, row);
                        if (itemIndex >= 0 && itemIndex < this.props.itemCount) {
                            const times = this.itemMap.compareSizeByPosition(column, row) ? 3 : 0;
                            getRectSizeSync(`${this.props.queryPrefix}#${this.preset.id}-${itemIndex}`, 100, times).then(({ height }) => {
                                if (typeof height === 'number' && height > 0 && !this.itemMap.compareSizeByPosition(column, row, height)) {
                                    this.itemMap.setSizeByPosition(column, row, height);
                                }
                            });
                        }
                    }
                }
            }, 0);
        }
    }
    // Lazily create and cache item styles while scrolling,
    // So that pure component sCU will prevent re-renders.
    // We maintain this cache, and pass a style prop rather than index,
    // So that List can clear cached styles and force item re-render if necessary.
    _getRangeToRender(columnIndex = 0) {
        return this.itemMap.getRangeToRender(this.state.scrollDirection, columnIndex, this.state.scrollOffset, this.state.isScrolling);
    }
    scrollTo(scrollOffset = 0, enhanced = this.preset.enhanced) {
        scrollOffset = Math.max(0, scrollOffset);
        if (this.state.scrollOffset === scrollOffset)
            return;
        if (enhanced) {
            const option = {
                animated: true,
                duration: 300,
            };
            option.top = scrollOffset;
            return getScrollViewContextNode(`${this.props.queryPrefix}#${this.preset.id}`).then((node) => node.scrollTo(option));
        }
        this.setState((prevState) => {
            if (prevState.scrollOffset === scrollOffset) {
                return null;
            }
            return {
                scrollDirection: prevState.scrollOffset < scrollOffset ? 'forward' : 'backward',
                scrollOffset,
                scrollUpdateWasRequested: true
            };
        }, this._resetIsScrollingDebounced);
    }
    scrollToItem(index, align = 'auto', enhanced = this.preset.enhanced) {
        const { itemCount } = this.props;
        const { scrollOffset } = this.state;
        index = Math.max(0, Math.min(index, itemCount - 1));
        this.scrollTo(this.itemMap.getOffsetForIndexAndAlignment(index, align, scrollOffset), enhanced);
    }
    componentDidMount() {
        const { initialScrollOffset } = this.props;
        if (typeof initialScrollOffset === 'number' && this._outerRef != null) {
            this._outerRef.scrollTop = initialScrollOffset;
        }
        this._callPropsCallbacks();
        this.preset.boundaryDetection();
    }
    componentDidUpdate(prevProps, prevState) {
        const { scrollOffset, scrollUpdateWasRequested } = this.state;
        this.preset.update(this.props);
        if (scrollUpdateWasRequested && this._outerRef != null) {
            this._outerRef.scrollTop = scrollOffset;
        }
        this._callPropsCallbacks(prevProps, prevState);
    }
    componentWillUnmount() {
        if (this._resetIsScrollingTimeoutId !== null) {
            cancelTimeout(this._resetIsScrollingTimeoutId);
        }
        this.preset.dispose();
    }
    getRenderItemNode(itemIndex, type = 'node') {
        const { item, itemData, itemKey = defaultItemKey, useIsScrolling } = this.props;
        const { isScrolling } = this.state;
        const key = itemKey(itemIndex, itemData);
        const style = this.preset.getItemStyle(itemIndex);
        if (type === 'placeholder') {
            return React.createElement(this.preset.itemElement, {
                key,
                id: `${this.preset.id}-${itemIndex}-wrapper`,
                style: this.preset.isBrick ? style : { display: 'none' }
            });
        }
        return React.createElement(this.preset.itemElement, {
            key,
            id: `${this.preset.id}-${itemIndex}-wrapper`,
            style
        }, React.createElement(item, {
            id: `${this.preset.id}-${itemIndex}`,
            data: itemData,
            index: itemIndex,
            isScrolling: useIsScrolling ? isScrolling : undefined
        }));
    }
    getRenderColumnNode(columnIndex) {
        const columnProps = {
            key: `${this.preset.id}-column-${columnIndex}`,
            id: `${this.preset.id}-column-${columnIndex}`,
            style: {
                height: '100%',
                position: 'relative',
                width: convertNumber2PX(this.itemMap.columnWidth)
            }
        };
        const [startIndex, stopIndex] = this._getRangeToRender(columnIndex);
        const items = [];
        if (this.preset.isRelative && !this.preset.isBrick) {
            const pre = convertNumber2PX(this.itemMap.getOffsetSizeCache(columnIndex, startIndex));
            items.push(React.createElement(this.preset.itemElement, {
                key: `${this.preset.id}-${columnIndex}-pre`,
                id: `${this.preset.id}-${columnIndex}-pre`,
                style: {
                    height: pre,
                    width: '100%'
                }
            }));
        }
        const placeholderCount = this.preset.placeholderCount;
        const restCount = this.itemMap.getColumnLength(columnIndex) - stopIndex;
        const prevPlaceholder = startIndex < placeholderCount ? startIndex : placeholderCount;
        const postPlaceholder = restCount < placeholderCount ? restCount : placeholderCount;
        const visibleItem = (stopIndex + postPlaceholder) * this.itemMap.columns + columnIndex;
        this.itemMap.updateItem(visibleItem);
        for (let row = 0; row < stopIndex + postPlaceholder; row++) {
            const itemIndex = this.itemMap.getItemIndexByPosition(columnIndex, row);
            if (itemIndex >= 0 && itemIndex < this.props.itemCount) {
                if (!this.preset.isBrick) {
                    if (row < startIndex - prevPlaceholder) {
                        row = startIndex - prevPlaceholder;
                        continue;
                    }
                }
                if (row < startIndex || row > stopIndex) {
                    items.push(this.getRenderItemNode(itemIndex, 'placeholder'));
                }
                else {
                    items.push(this.getRenderItemNode(itemIndex));
                }
            }
        }
        return React.createElement(this.preset.innerElement, columnProps, items);
    }
    render() {
        const _a = omit(this.props, [
            'item', 'itemCount', 'itemData', 'itemKey', 'useIsScrolling',
            'innerElementType', 'innerTagName', 'itemElementType', 'itemTagName',
            'outerElementType', 'outerTagName', 'onScrollToLower', 'onScrollToUpper',
            'upperThreshold', 'lowerThreshold',
            'position',
        ]), { className, style, height, width, enhanced, outerWrapper, renderTop, renderBottom } = _a, rest = __rest(_a, ["className", "style", "height", "width", "enhanced", "outerWrapper", "renderTop", "renderBottom"]);
        const { isScrolling, scrollOffset, scrollUpdateWasRequested } = this.state;
        const estimatedHeight = convertNumber2PX(this.itemMap.maxColumnSize);
        const outerProps = Object.assign(Object.assign({}, rest), { id: this.preset.id, className: classNames(className, 'virtual-waterfall'), onScroll: this._onScroll, ref: this._outerRefSetter, style: Object.assign({ height: convertNumber2PX(height), width: convertNumber2PX(width), overflow: 'auto', WebkitOverflowScrolling: 'touch', willChange: 'transform' }, style), enhanced, outerElementType: this.preset.outerElement, innerElementType: this.preset.innerElement, renderTop,
            renderBottom });
        if (!this.preset.enhanced) {
            outerProps.scrollTop = scrollUpdateWasRequested ? scrollOffset : this.preset.field.scrollTop;
        }
        const columnNodes = [];
        for (let i = 0; i < this.itemMap.columns; i++) {
            columnNodes.push(this.getRenderColumnNode(i));
        }
        return React.createElement(outerWrapper || this.preset.outerElement, outerProps, React.createElement(this.preset.innerElement, {
            key: `${this.preset.id}-wrapper`,
            id: `${this.preset.id}-wrapper`,
            className: classNames(className, 'virtual-waterfall-wrapper'),
            style: Object.assign({ display: 'flex', justifyContent: 'space-evenly', pointerEvents: isScrolling ? 'none' : 'auto', position: 'relative', height: estimatedHeight, width: '100%' }, style),
        }, columnNodes));
    }
}
Waterfall.defaultProps = {
    itemData: undefined,
    overscanDistance: 50,
    useIsScrolling: false,
    shouldResetStyleCacheOnItemSizeChange: true
};

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return Waterfall; } });
//# sourceMappingURL=waterfall.js.map

}, function(modId) { var map = {"../../../utils/index.js":1768876401574,"../constants.js":1768876401594,"../preset.js":1768876401595,"../../../utils/timer.js":1768876401580,"../../../utils/dom.js":1768876401576,"../../../utils/helper.js":1768876401577,"../../../utils/convert.js":1768876401575,"../../../utils/lodash.js":1768876401578}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401599, function(require, module, exports) {
var __TEMP__ = require('tslib');var __rest = __TEMP__['__rest'];
var __TEMP__ = require('react');var React = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('../../../utils/index.js');
var __TEMP__ = require('../../../utils/convert.js');var convertPX2Int = __TEMP__['convertPX2Int'];

function getRenderExpandNodes({ direction, id: sid, innerElement, renderExpand, }) {
    const id = `${sid}-${direction}`;
    const props = {
        key: id,
        id,
    };
    if (!renderExpand) {
        props.style = {
            visibility: 'hidden',
            height: 100,
            marginTop: -100,
            zIndex: -1,
        };
    }
    return React.createElement(renderExpand || innerElement, props);
}
const outerWrapper = React.forwardRef(function OuterWrapper(props, ref) {
    const _a = props, { id, className, style, children, outerElementType, innerElementType, onScroll, onScrollNative, renderTop, renderBottom } = _a, rest = __rest(_a, ["id", "className", "style", "children", "outerElementType", "innerElementType", "onScroll", "onScrollNative", "renderTop", "renderBottom"]);
    const handleScroll = (event) => {
        onScroll === null || onScroll === void 0 ? void 0 : onScroll(Object.assign(Object.assign({}, event), { currentTarget: Object.assign(Object.assign({}, event.detail), { clientWidth: convertPX2Int(style.width), clientHeight: convertPX2Int(style.height) }) }));
        if (typeof onScrollNative === 'function') {
            onScrollNative(event);
        }
    };
    return React.createElement(outerElementType, Object.assign({ ref,
        id,
        className,
        style, scrollY: true, onScroll: handleScroll }, rest), [
        getRenderExpandNodes({
            direction: 'top',
            id,
            innerElement: innerElementType,
            renderExpand: renderTop,
        }),
        children,
        getRenderExpandNodes({
            direction: 'bottom',
            id,
            innerElement: innerElementType,
            renderExpand: renderBottom,
        }),
    ]);
});

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'default', { enumerable: true, configurable: true, get: function() { return outerWrapper; } });
//# sourceMappingURL=wrapper.js.map

}, function(modId) { var map = {"../../../utils/index.js":1768876401574,"../../../utils/convert.js":1768876401575}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401569);
})()
//miniprogram-npm-outsideDeps=["@tarojs/shared","memoize-one","vue","@tarojs/taro","@tarojs/runtime","tslib","@tarojs/components","react","classnames"]
//# sourceMappingURL=index.js.map