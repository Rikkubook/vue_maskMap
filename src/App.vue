<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row flex-nowrap">
        <b-card
          title="Card Title"
          img-src="https://picsum.photos/600/300/?image=25"
          img-alt="Image"
          img-top
          tag="article"
          class="ri-sideMenu"
        >
          <b-form v-if="show">
            <b-form-group id="input-group-3" label="城市:" label-for="input-city">
              <!-- <b-form-select
                id="input-city"
                v-model="form.city"
                :options="cityArray"
                required
                @change="removeMark();updateMap()"  //監聽改變
              /> -->
              <b-form-select
                id="input-city"
                v-model="form.city"
                :options="cityArray"
                required
              />
            </b-form-group>
            <b-form-group id="input-group-3" label="區域:" label-for="input-city">
              <b-form-select
                id="input-city"
                v-model="form.area"
                :options="areaArray"
                required
              />
            </b-form-group>
            <b-button type="submit" variant="primary">Submit</b-button>
          </b-form>
        </b-card>
        <div id="mapid"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import TWcity from '@/assets/TWcity.json'
import axios from 'axios'
import { BCard, BForm, BFormGroup, BFormSelect, BButton } from 'bootstrap-vue'

console.log(L)

let openStreetMap = {};

export default {
  name: 'App',
  components: { BCard, BForm, BFormGroup, BFormSelect, BButton },
  data () {
    return {
      form: {
        city: '臺北市',
        area: null
      },
      cityArray: [{ text: '請選擇城市', value: null }],
      areaArray: [{ text: '請選擇區域', value: null }],
      show: true,
      openStreetMap: {},
      Pharmacy: []
    }
  },
  mounted() {
    // Step1 添加下拉選單的城市
    // TWcity.forEach((cityItem) => { this.cityArray = [...this.cityArray, { text: cityItem.CityName, value: cityItem.CityEngName }] })
    TWcity.forEach((cityItem) => { this.cityArray.push({ text: cityItem.CityName, value: cityItem.CityName }) })

    // Step2 載入藥局
    const api = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
    axios.get(api).then((response) => {
      this.Pharmacy = response.data.features
      this.updateMap()
    })

    // Step3 產生地圖位置
    openStreetMap = L.map('mapid', {
      center: [25.042474, 121.513729],
      zoom: 18,
    })
    // Step3 載入底圖的地圖
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
    }).addTo(openStreetMap)

    // Step3 添加圖標
    L.marker([25.042474, 121.513729]).addTo(openStreetMap)
  },
  watch: {
    // Step1  添加區域
    'form.city' () {
      // console.log(this.form.city)
      // const areaChose = TWcity.filter(cityItem => cityItem.CityName === this.form.city) // 會找多個
      const areaChose = TWcity.find(cityItem => cityItem.CityName === this.form.city) // 只會找一個
      this.form.area = null // 重設
      this.areaArray = [{ text: '請選擇區域', value: null }] // 重設
      // areaChose[0].AreaList.forEach((areaItem) => { this.areaArray = [...this.areaArray, { text: areaItem.AreaName, value: areaItem.AreaEngName }] })
      // areaChose[0].AreaList.forEach((areaItem) => { this.areaArray.push({ text: areaItem.AreaName, value: areaItem.AreaName }) }) // 會找多個
      areaChose.AreaList.forEach((areaItem) => { this.areaArray.push({ text: areaItem.AreaName, value: areaItem.AreaName }) }) // 只會找一個
      this.removeMark()
      this.updateMap()
    }
  },
  methods:{
    // Step1 +Step3 換區域時更新圖資
    updateMap () {
      // 取臺北市
      const pharmacies = this.Pharmacy.filter( pharmacyItem => pharmacyItem.properties.county == this.form.city)
      console.log(pharmacies)

      // 添加圖標
      pharmacies.forEach((pharmacyItem)=>{
        const { properties, geometry } =pharmacyItem // 可以用解構的方式比較不會那麼長
        L.marker([ 
          // pharmacyItem.geometry.coordinates[1],
          // pharmacyItem.geometry.coordinates[0]
          geometry.coordinates[1],
          geometry.coordinates[0]
        ]).addTo(openStreetMap)
        .bindPopup(`藥局名稱 ${ properties.name }`) // 點他會有文字內容
      })
    },
    // Step1 +Step3 換區域時清除圖資
    removeMark () {
      // 跑所有圖層
      openStreetMap.eachLayer((layer)=>{
        if(layer instanceof L.Marker){
          openStreetMap.removeLayer(layer)
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/sass/all.scss';

*{
  outline: 1px solid red;
}
.ri-sideMenu{
  width: 300px;
  height: 100vh;
}
#mapid {
  width: 100%;
}
</style>
