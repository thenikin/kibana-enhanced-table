import './enhanced-table-vis.less';
import './enhanced-table-vis-controller';
import './enhanced-table-vis-params';
import 'ui/agg_table';
import 'ui/agg_table/agg_table_group';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { Schemas } from 'ui/vis/editors/default/schemas';
import tableVisTemplate from './enhanced-table-vis.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisResponseHandlersRegistryProvider } from 'ui/registry/vis_response_handlers';
import image from './images/icon-table.svg';

// we need to load the css ourselves

// we also need to load the controller and used by the template

// our params are a bit complex so we will manage them with a directive

// require the directives that we use as well

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(EnhancedTableVisProvider);

// define the TableVisType
function EnhancedTableVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const visResponseHandlers = VisResponseHandlersRegistryProvider(Private);
  const tabifyResponseHandler = visResponseHandlers.byName.tabify.handler;

  const customResponseHandler = function(vis, response) {
    return tabifyResponseHandler(vis, response).then(function(tabifiedResponse) {
      tabifiedResponse.totalHits = response.hits.total;
      return tabifiedResponse;
    });
  };

  // define the EnhancedTableVisProvider which is used in the template
  // by angular's ng-controller directive

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    type: 'table',
    name: 'enhanced-table',
    title: 'Enhanced Table',
    image,
    description: 'Same functionality than Data Table, but with enhanced features like computed columns and filter bar.',
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        perPage: 10,
        showPartialRows: false,
        showMetricsAtAllLevels: false,
        sort: {
          columnIndex: null,
          direction: null
        },
        showTotal: false,
        totalFunc: 'sum',
        computedColumns: [],
        computedColsPerSplitCol: false,
        hideExportLinks: false,
        showFilterBar: false,
        filterCaseSensitive: false,
        filterBarHideable: false,
        filterAsYouType: false,
        filterBarWidth: '25%'
      },
      template: tableVisTemplate
    },
    editorConfig: {
      optionsTemplate: '<enhanced-table-vis-params></enhanced-table-vis-params>',
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          aggFilter: ['!geo_centroid', '!geo_bounds'],
          min: 1,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'buckets',
          name: 'split',
          title: 'Split Table',
          aggFilter: ['!filter']
        },
        {
          group: 'buckets',
          name: 'bucket',
          title: 'Split Rows',
          aggFilter: ['!filter']
        },
        {
          group: 'buckets',
          name: 'splitcols',
          title: 'Split Cols',
          aggFilter: ['!filter'],
          max: 1,
          editor: '<div class="hintbox"><i class="fa fa-danger text-info"></i> This bucket must be the last one</div>'
        }
      ])
    },
    responseHandler: customResponseHandler,
    responseHandlerConfig: {
      asAggConfigResults: true
    },
    hierarchicalData: function (vis) {
      return Boolean(vis.params.showPartialRows || vis.params.showMetricsAtAllLevels);
    }
  });
}

export default EnhancedTableVisProvider;
